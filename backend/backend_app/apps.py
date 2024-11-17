"""
Configuration for the backend_app Django application.

This module defines the application configuration for the backend_app,
including the default settings for the app's models and its registration
with the Django project.
"""

from django.apps import AppConfig


class BackendAppConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'backend_app'
