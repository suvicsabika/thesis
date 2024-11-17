"""
Admin customizations for the backend application.

This module defines the configuration for the Django admin interface,
including readonly fields and custom admin classes for the following models:
- MyUser
- PasswordResetToken
- Subject
- Course
- Task
- TaskSubmission
- TaskFile
- TaskAssignment
- Announcement
- Reaction
- Comment
- SubmissionFile
- Invitation
"""

from django.contrib import admin
from .models import MyUser, Subject, Course, Task, TaskSubmission, TaskFile, Announcement, \
    Reaction, Comment, TaskAssignment, SubmissionFile, Invitation, PasswordResetToken


class MyUserAdmin(admin.ModelAdmin):
    readonly_fields = ('id',)


class PasswordResetTokenAdmin(admin.ModelAdmin):
    readonly_fields = ('id', 'user')


class SubjectAdmin(admin.ModelAdmin):
    readonly_fields = ('id',)


class CourseAdmin(admin.ModelAdmin):
    readonly_fields = ('id',)


class TaskAdmin(admin.ModelAdmin):
    readonly_fields = ('id',)


class TaskFileAdmin(admin.ModelAdmin):
    readonly_fields = ('id', 'task')


class TaskAssignmentAdmin(admin.ModelAdmin):
    readonly_fields = ('id', 'task')


class TaskSubmissionAdmin(admin.ModelAdmin):
    readonly_fields = ('id', 'assignment')


class SubmissionFileAdmin(admin.ModelAdmin):
    readonly_fields = ('id', 'submission')


class AnnouncementAdmin(admin.ModelAdmin):
    readonly_fields = ('id', 'course')


class ReactionAdmin(admin.ModelAdmin):
    readonly_fields = ('id', 'announcement')


class CommentAdmin(admin.ModelAdmin):
    readonly_fields = ('id', 'announcement')


class InvitationAdmin(admin.ModelAdmin):
    readonly_fields = ('id', 'course')


admin.site.register(MyUser, MyUserAdmin)
admin.site.register(PasswordResetToken, PasswordResetTokenAdmin)
admin.site.register(Subject, SubjectAdmin)
admin.site.register(Course, CourseAdmin)
admin.site.register(Task, TaskAdmin)
admin.site.register(TaskSubmission, TaskSubmissionAdmin)
admin.site.register(TaskFile, TaskFileAdmin)
admin.site.register(TaskAssignment, TaskAssignmentAdmin)
admin.site.register(Announcement, AnnouncementAdmin)
admin.site.register(Reaction, ReactionAdmin)
admin.site.register(Comment, CommentAdmin)
admin.site.register(SubmissionFile, SubmissionFileAdmin)
admin.site.register(Invitation, InvitationAdmin)
