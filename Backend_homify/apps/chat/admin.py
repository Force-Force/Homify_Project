"""
Admin configuration for messages app.
"""
from django.contrib import admin
from .models import Message


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    """Admin for Message model."""
    
    list_display = ('sender', 'recipient', 'property', 'subject', 'is_read', 'sent_at')
    list_filter = ('is_read', 'sent_at')
    search_fields = ('sender__email', 'recipient__email', 'subject', 'content')
    readonly_fields = ('sent_at', 'read_at')
