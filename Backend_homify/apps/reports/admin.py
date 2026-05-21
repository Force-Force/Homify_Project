"""
Admin configuration for reports app.
"""
from django.contrib import admin
from .models import Report


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    """Admin for Report model."""
    
    list_display = ('id', 'reporter', 'reason', 'status', 'created_at')
    list_filter = ('reason', 'status', 'created_at')
    search_fields = ('reporter__email', 'description')
    readonly_fields = ('created_at', 'resolved_at')
