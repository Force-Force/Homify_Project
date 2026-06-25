from django.contrib import admin

from .models import Notification, NotificationPreference


@admin.register(NotificationPreference)
class NotificationPreferenceAdmin(admin.ModelAdmin):
    list_display = ('user', 'email_notifications', 'message_alerts', 'new_listing_alerts', 'updated_at')
    search_fields = ('user__email',)


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'notification_type', 'read_at', 'created_at')
    list_filter = ('notification_type', 'read_at')
    search_fields = ('title', 'user__email')
    readonly_fields = ('created_at',)
