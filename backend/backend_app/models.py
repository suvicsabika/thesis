"""
Custom models for the backend application.

This module defines the needed models and their relations, the models:
- MyUser
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
from datetime import timedelta
from uuid import uuid4

from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from django.utils.crypto import get_random_string
from django.utils.timezone import now

from backend_app.services import user_submission_directory_path, task_files_directory_path
from backend_project import settings


class MyUser(AbstractUser):
    date_of_birth = models.DateField(null=True, blank=True)
    profile_picture = models.ImageField(upload_to='profiles/', null=True, blank=True)  # Specify the upload path

    class Role(models.TextChoices):
        STUDENT = 'Student', 'Student'
        TEACHER = 'Teacher', 'Teacher'

    role = models.CharField(max_length=10, choices=Role.choices, default=Role.STUDENT)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

    def save(self, *args, **kwargs):
        if self.profile_picture:
            self.profile_picture.name = f"{self.first_name.lower()}_{self.last_name.lower()}/{self.profile_picture.name}"  # Set the path
        super().save(*args, **kwargs)


class PasswordResetToken(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    token = models.CharField(max_length=64, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def is_valid(self):
        """Check if the token is still valid (e.g., within 1 hour)."""
        expiry_time = self.created_at + timedelta(hours=1)
        return now() < expiry_time

    @staticmethod
    def generate_token():
        """Generate a secure random token."""
        return get_random_string(length=64)

    def __str__(self):
        return f"Password reset token for {self.user.email}"


class Subject(models.Model):
    name = models.CharField(max_length=100)
    grade = models.PositiveIntegerField()
    category = models.CharField(max_length=100)

    class Meta:
        unique_together = ('name', 'grade', 'category')

    def __str__(self):
        return f"{self.name} (Grade {self.grade})"


class Course(models.Model):
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    teacher = models.ForeignKey(MyUser, limit_choices_to={'role': 'Teacher'}, on_delete=models.CASCADE)
    description = models.CharField(max_length=500, default="Write a short description about the course...")
    schedule = models.DateTimeField(default=timezone.now)
    room = models.CharField(max_length=100)
    students = models.ManyToManyField(MyUser, limit_choices_to={'role': 'Student'}, related_name='enrolled_courses',
                                      blank=True, db_index=True)

    def __str__(self):
        return f"{self.subject.name} - {self.teacher.username} - {self.schedule.strftime('%Y-%m-%d %H:%M')}"


class Task(models.Model):
    course = models.ForeignKey(Course, on_delete=models.PROTECT)
    title = models.CharField(max_length=100)
    description = models.TextField()
    deadline = models.DateTimeField(default=timezone.now)
    assigned_by = models.ForeignKey(MyUser, limit_choices_to={'role': 'Teacher'}, on_delete=models.PROTECT, db_index=True)

    def __str__(self):
        return f"{self.title} - {self.course.subject.name}"


class TaskFile(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='files')
    file = models.FileField(null=True, blank=True, upload_to=task_files_directory_path)  # Custom upload path
    file_name = models.CharField(max_length=255)
    upload_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.task.title} - {self.file_name} by {self.task.assigned_by.get_full_name()}"


class TaskAssignment(models.Model):
    class Status(models.TextChoices):
        PENDING = 'Pending', 'Pending'
        SUBMITTED = 'Submitted', 'Submitted'
        GRADED = 'Graded', 'Graded'
        OVERDUE = 'Overdue', 'Overdue'

    task = models.ForeignKey(Task, on_delete=models.CASCADE, db_index=True)
    student = models.ForeignKey(MyUser, limit_choices_to={'role': 'Student'}, on_delete=models.PROTECT, db_index=True)
    assigned_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.PENDING,
    )
    personal_notes = models.TextField(blank=True, max_length=500)
    teacher_feedback = models.TextField(blank=True, max_length=500)
    time_spent = models.DurationField(null=True, blank=True)
    is_late = models.BooleanField(default=False)
    late_due_date = models.DateTimeField(null=True, blank=True)
    grade = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ('task', 'student')
        indexes = [models.Index(fields=['task', 'student'])]

    def __str__(self):
        return f"{self.student.username} - {self.task.title} - TaskID: {self.task.id}"


class TaskSubmission(models.Model):
    assignment = models.ForeignKey(TaskAssignment, on_delete=models.CASCADE, db_index=True)
    submission_date = models.DateTimeField(auto_now_add=True)
    comments = models.TextField(blank=True, max_length=500)

    def __str__(self):
        return f"Submission for {self.assignment.task.title} by {self.assignment.student.username}"


class SubmissionFile(models.Model):
    submission = models.ForeignKey(TaskSubmission, on_delete=models.CASCADE, related_name='files')
    file = models.FileField(null=True, blank=True, upload_to=user_submission_directory_path)  # Custom upload path
    file_name = models.CharField(max_length=255)
    upload_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.submission.assignment.task.title} - {self.file_name} by {self.submission.assignment.student.get_full_name()}"


class Announcement(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, db_index=True)
    title = models.CharField(max_length=100)
    content = models.TextField()
    date = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(MyUser, on_delete=models.CASCADE)

    def __str__(self):
        return self.title


class Reaction(models.Model):
    REACTION_CHOICES = [
        ('happy', 'Happy'),
        ('sad', 'Sad'),
        ('angry', 'Angry'),
        ('like', 'Like'),
        ('dislike', 'Dislike'),
    ]

    announcement = models.ForeignKey(Announcement, on_delete=models.CASCADE, related_name='reactions')
    user = models.ForeignKey(MyUser, on_delete=models.CASCADE)
    reaction_type = models.CharField(max_length=10, choices=REACTION_CHOICES)
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.user.username} reacted {self.reaction_type} to {self.announcement.title}'


class Comment(models.Model):
    announcement = models.ForeignKey(Announcement, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(MyUser, on_delete=models.CASCADE)
    content = models.TextField()
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Comment by {self.user.username} on {self.announcement.title}'


class Invitation(models.Model):
    email = models.EmailField()
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    token = models.UUIDField(default=uuid4, editable=False, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    accepted = models.BooleanField(default=False)

    def __str__(self):
        return f"Invitation for {self.email} to join {self.course.subject}"