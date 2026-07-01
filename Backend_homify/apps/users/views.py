"""
Views for user authentication and management.
"""
from rest_framework import generics, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.serializers import TokenRefreshSerializer

from django.contrib.auth import get_user_model

from apps.core.exceptions import BusinessLogicError
from apps.core.utils import business_error_response
from apps.core.services import UserLifecycleService, AuthService, UserAuditService

from .serializers import (
    UserRegistrationSerializer, UserSerializer, UserProfileSerializer,
    PasswordChangeSerializer, AdminUserSerializer, PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer, EmailVerifySerializer, ResendVerificationSerializer,
    LogoutSerializer, AccountDeleteSerializer, CustomTokenObtainPairSerializer,
    LandlordVerificationSubmitSerializer, LandlordVerificationRequestSerializer,
    LandlordVerificationReviewSerializer,
)
from .permissions import IsAdmin
from .verification import LandlordVerificationService, VerificationError
from .models import LandlordVerificationRequest

User = get_user_model()


class UserRegistrationView(generics.CreateAPIView):
    """User registration endpoint."""

    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = UserRegistrationSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        return Response({
            'message': 'Inscription réussie. Veuillez vérifier votre email.',
            'user': UserSerializer(user).data,
        }, status=status.HTTP_201_CREATED)


class CustomTokenObtainPairView(TokenObtainPairView):
    """Login with email — blocks suspended/unverified accounts."""
    serializer_class = CustomTokenObtainPairSerializer


class HomifyTokenRefreshSerializer(TokenRefreshSerializer):
    """Re-validate account status when refreshing tokens."""

    def validate(self, attrs):
        data = super().validate(attrs)
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken(attrs['refresh'])
        user = User.objects.get(id=refresh['user_id'])
        AuthService.ensure_user_can_authenticate(user)
        return data


class CustomTokenRefreshView(TokenRefreshView):
    serializer_class = HomifyTokenRefreshSerializer


class LogoutView(APIView):
    """Blacklist refresh token on logout."""

    permission_classes = (IsAuthenticated,)

    def post(self, request):
        serializer = LogoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            AuthService.blacklist_refresh_token(serializer.validated_data['refresh'])
        except Exception:
            return Response(
                {'error': 'Token invalide.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response({'message': 'Déconnecté avec succès.'})


class EmailVerifyView(APIView):
    """Verify email with token from registration email."""

    permission_classes = (AllowAny,)

    def post(self, request):
        serializer = EmailVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            user = AuthService.verify_email(serializer.validated_data['token'])
        except BusinessLogicError as exc:
            return business_error_response(exc)
        return Response({
            'message': 'Email vérifié avec succès. Vous pouvez vous connecter.',
            'user': UserSerializer(user).data,
        })


class ResendVerificationView(APIView):
    """Resend verification email."""

    permission_classes = (AllowAny,)

    def post(self, request):
        serializer = ResendVerificationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            AuthService.resend_verification(serializer.validated_data['email'])
        except BusinessLogicError as exc:
            return business_error_response(exc)
        return Response({
            'message': 'Si un compte existe avec cet email, un lien de vérification a été envoyé.',
        })


class ForgotPasswordView(APIView):
    """Request password reset email."""

    permission_classes = (AllowAny,)

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        AuthService.request_password_reset(serializer.validated_data['email'])
        return Response({
            'message': 'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.',
        })


class ResetPasswordView(APIView):
    """Reset password with token."""

    permission_classes = (AllowAny,)

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            AuthService.reset_password(
                serializer.validated_data['token'],
                serializer.validated_data['password'],
            )
        except BusinessLogicError as exc:
            return business_error_response(exc)
        return Response({'message': 'Mot de passe réinitialisé avec succès.'})


class UserProfileView(generics.RetrieveUpdateAPIView):
    """Get and update user profile."""

    permission_classes = (IsAuthenticated,)
    serializer_class = UserProfileSerializer

    def get_object(self):
        return self.request.user


class PasswordChangeView(generics.GenericAPIView):
    """Change user password."""

    permission_classes = (IsAuthenticated,)
    serializer_class = PasswordChangeSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user
        if not user.check_password(serializer.validated_data['old_password']):
            return Response(
                {'old_password': 'Mot de passe incorrect.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(serializer.validated_data['new_password'])
        user.save()
        AuthService.revoke_all_tokens(user)

        return Response({'message': 'Mot de passe modifié avec succès.'})


class AccountDeleteView(APIView):
    """Self-service account deletion (soft delete)."""

    permission_classes = (IsAuthenticated,)

    def post(self, request):
        serializer = AccountDeleteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            AuthService.delete_own_account(request.user, serializer.validated_data['password'])
        except BusinessLogicError as exc:
            return business_error_response(exc)
        return Response({'message': 'Compte supprimé avec succès.'})


class AdminUserViewSet(viewsets.ModelViewSet):
    """Admin user management viewset."""

    queryset = User.objects.exclude(status='DELETED')
    serializer_class = AdminUserSerializer
    permission_classes = (IsAuthenticated, IsAdmin)
    filterset_fields = ['role', 'status', 'email_verified']
    search_fields = ['email', 'first_name', 'last_name']
    ordering_fields = ['created_at', 'last_login_at']
    http_method_names = ['get', 'patch', 'head', 'options', 'post']

    @action(detail=True, methods=['post'])
    def suspend(self, request, pk=None):
        user = self.get_object()
        try:
            UserAuditService.ensure_not_self(request.user, user, 'une suspension')
            UserLifecycleService.suspend(user)
            UserAuditService.log(request.user, user, 'SUSPEND')
        except BusinessLogicError as exc:
            return business_error_response(exc)
        return Response({
            'message': f'Utilisateur {user.email} suspendu.',
            'user': self.get_serializer(user).data,
        })

    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        user = self.get_object()
        try:
            UserLifecycleService.activate(user)
            UserAuditService.log(request.user, user, 'ACTIVATE')
        except BusinessLogicError as exc:
            return business_error_response(exc)
        return Response({
            'message': f'Utilisateur {user.email} réactivé.',
            'user': self.get_serializer(user).data,
        })

    @action(detail=True, methods=['post'])
    def soft_delete(self, request, pk=None):
        user = self.get_object()
        try:
            UserAuditService.ensure_not_self(request.user, user, 'une suppression')
            UserLifecycleService.soft_delete(user)
            UserAuditService.log(request.user, user, 'SOFT_DELETE')
        except BusinessLogicError as exc:
            return business_error_response(exc)
        return Response({
            'message': f'Utilisateur {user.email} supprimé.',
            'user': self.get_serializer(user).data,
        })

    @action(detail=False, methods=['get'])
    def audit_logs(self, request):
        """Recent admin audit entries."""
        from apps.users.models import UserAuditLog
        from rest_framework import serializers as drf_serializers

        class AuditLogSerializer(drf_serializers.ModelSerializer):
            actor_email = drf_serializers.EmailField(source='actor.email', read_only=True)
            target_email = drf_serializers.EmailField(source='target.email', read_only=True)

            class Meta:
                model = UserAuditLog
                fields = ('id', 'action', 'actor_email', 'target_email', 'details', 'created_at')

        logs = UserAuditLog.objects.select_related('actor', 'target').all()[:100]
        serializer = AuditLogSerializer(logs, many=True)
        return Response(serializer.data)


class LandlordVerificationMeView(APIView):
    """Landlord KYC — submit and check status."""

    permission_classes = (IsAuthenticated,)

    def get(self, request):
        if request.user.role not in ('LANDLORD', 'ADMIN'):
            return Response({'error': 'Réservé aux propriétaires.'}, status=status.HTTP_403_FORBIDDEN)
        latest = LandlordVerificationService.get_latest_request(request.user)
        return Response({
            'landlord_verified': request.user.landlord_verified,
            'request': LandlordVerificationRequestSerializer(latest).data if latest else None,
        })

    def post(self, request):
        if request.user.role not in ('LANDLORD', 'ADMIN'):
            return Response({'error': 'Réservé aux propriétaires.'}, status=status.HTTP_403_FORBIDDEN)
        serializer = LandlordVerificationSubmitSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            req = LandlordVerificationService.submit(
                request.user,
                id_number=serializer.validated_data.get('id_number', ''),
                note=serializer.validated_data.get('note', ''),
            )
        except VerificationError as exc:
            return business_error_response(exc)
        return Response(
            {
                'message': 'Demande de vérification envoyée.',
                'request': LandlordVerificationRequestSerializer(req).data,
            },
            status=status.HTTP_201_CREATED,
        )


class AdminLandlordVerificationViewSet(viewsets.ReadOnlyModelViewSet):
    """Admin review of landlord KYC requests."""

    queryset = LandlordVerificationRequest.objects.select_related('user', 'reviewed_by')
    serializer_class = LandlordVerificationRequestSerializer
    permission_classes = (IsAuthenticated, IsAdmin)
    filterset_fields = ('status',)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        req = self.get_object()
        serializer = LandlordVerificationReviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            LandlordVerificationService.approve(
                req,
                request.user,
                admin_note=serializer.validated_data.get('admin_note', ''),
            )
        except VerificationError as exc:
            return business_error_response(exc)
        return Response({
            'message': 'Propriétaire vérifié.',
            'request': self.get_serializer(req).data,
        })

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        req = self.get_object()
        serializer = LandlordVerificationReviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            LandlordVerificationService.reject(
                req,
                request.user,
                admin_note=serializer.validated_data.get('admin_note', ''),
            )
        except VerificationError as exc:
            return business_error_response(exc)
        return Response({
            'message': 'Demande refusée.',
            'request': self.get_serializer(req).data,
        })
