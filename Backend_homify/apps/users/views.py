"""
Views for user authentication and management.
"""
from rest_framework import generics, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CustomTokenObtainPairSerializer
from django.contrib.auth import get_user_model
from .serializers import (
    UserRegistrationSerializer, UserSerializer, UserProfileSerializer,
    PasswordChangeSerializer, AdminUserSerializer
)
from .permissions import IsAdmin

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
            'user': UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)


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
        
        # Check old password
        if not user.check_password(serializer.validated_data['old_password']):
            return Response(
                {'old_password': 'Mot de passe incorrect.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Set new password
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        
        return Response({'message': 'Mot de passe modifié avec succès.'})


class CustomTokenObtainPairView(TokenObtainPairView):
    """Custom token obtain view that uses email instead of username."""
    serializer_class = CustomTokenObtainPairSerializer


class AdminUserViewSet(viewsets.ModelViewSet):
    """Admin user management viewset."""

    queryset = User.objects.all()
    serializer_class = AdminUserSerializer
    permission_classes = (IsAuthenticated, IsAdmin)
    filterset_fields = ['role', 'status', 'email_verified']
    search_fields = ['email', 'first_name', 'last_name']
    ordering_fields = ['created_at', 'last_login_at']

    @action(detail=True, methods=['post'])
    def suspend(self, request, pk=None):
        """Suspend a user."""
        user = self.get_object()
        user.status = 'SUSPENDED'
        user.is_active = False
        user.save()

        return Response({
            'message': f'Utilisateur {user.email} suspendu.',
            'user': self.get_serializer(user).data
        })

    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Activate a suspended user."""
        user = self.get_object()
        user.status = 'ACTIVE'
        user.is_active = True
        user.save()

        return Response({
            'message': f'Utilisateur {user.email} réactivé.',
            'user': self.get_serializer(user).data
        })
