"""
Serializers for the backend application.

This module contains serializers for various models, including:
- User management (MyUser)
- Courses and subjects
- Announcements and reactions
- Tasks and submissions
- File handling for submissions and tasks
"""

from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from .models import (
    MyUser, Course, Announcement, Task, Reaction, Comment, Subject,
    TaskSubmission, TaskAssignment, SubmissionFile, TaskFile
)


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for user-related operations.

    Handles user creation with password hashing.
    """
    profile_picture = serializers.ImageField(required=False)

    def create(self, validated_data: dict) -> MyUser:
        """
        Hashes the user's password before creating the user instance.

        @param validated_data: Data to create a new user instance.
        @return: A newly created user instance.
        """
        validated_data['password'] = make_password(validated_data['password'])
        return super().create(validated_data)

    class Meta:
        model = MyUser
        fields = ['username', 'password', 'date_of_birth', 'role', 'first_name',
                  'last_name', 'email', 'profile_picture']


class SubjectSerializer(serializers.ModelSerializer):
    """
    Serializer for subject-related operations.
    """
    class Meta:
        model = Subject
        fields = ['id', 'name', 'grade', 'category']


class CourseSerializer(serializers.ModelSerializer):
    """
    Serializer for creating and managing courses by teachers.
    """
    class Meta:
        model = Course
        fields = ['id', 'subject', 'description', 'schedule', 'room', 'students']

    def create(self, validated_data: dict) -> Course:
        """
        Automatically assigns the teacher to the course being created.

        @param validated_data: Data to create a new course instance.
        @return: A newly created course instance.
        """
        teacher = self.context['request'].user
        validated_data['teacher'] = teacher
        return Course.objects.create(**validated_data)


class GetCoursesSerializer(serializers.ModelSerializer):
    """
    Serializer for retrieving course data for students and teachers.

    Includes additional fields like teacher's name and unsubmitted task count.
    """
    subject_name = serializers.CharField(source='subject.name')
    teacher_first_name = serializers.CharField(source='teacher.first_name')
    teacher_last_name = serializers.CharField(source='teacher.last_name')
    unsubmitted_tasks = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = ['id', 'subject_name', 'room', 'description', 'teacher_first_name',
                  'teacher_last_name', 'unsubmitted_tasks']

    def get_unsubmitted_tasks(self, course: Course) -> int:
        """
        Calculates the number of unsubmitted tasks for a student.

        @param course: The course instance.
        @return: The count of unsubmitted tasks for the student.
        """
        request = self.context.get('request')
        user = request.user if request else None

        if user and user.role == 'Student':
            tasks = Task.objects.filter(course=course)
            return TaskAssignment.objects.filter(
                student=user, task__in=tasks, status='Pending'
            ).count()

        return 0


class AnnouncementSerializer(serializers.ModelSerializer):
    """
    Serializer for announcements with user-related details.
    """
    user_full_name = serializers.StringRelatedField(source='user.get_full_name', read_only=True)

    class Meta:
        model = Announcement
        fields = ['id', 'title', 'user_full_name', 'content', 'date']


class ReactionSerializer(serializers.ModelSerializer):
    """
    Serializer for handling reactions to announcements.
    """
    user_full_name = serializers.StringRelatedField(source='user.get_full_name', read_only=True)

    class Meta:
        model = Reaction
        fields = ['user_full_name', 'announcement', 'reaction_type', 'date']


class CommentSerializer(serializers.ModelSerializer):
    """
    Serializer for handling comments on announcements.
    """
    user_full_name = serializers.StringRelatedField(source='user.get_full_name', read_only=True)

    class Meta:
        model = Comment
        fields = ['user_full_name', 'announcement', 'content', 'date']


class SubmissionFileSerializer(serializers.ModelSerializer):
    """
    Serializer for handling file submissions by students.
    """
    class Meta:
        model = SubmissionFile
        fields = ['file', 'file_name', 'upload_date']


class TaskAssignmentSerializer(serializers.ModelSerializer):
    """
    Serializer for task assignments, including student and task details.
    """
    student = serializers.StringRelatedField(source="student.get_full_name")
    task_title = serializers.CharField(source="task.title", read_only=True)

    class Meta:
        model = TaskAssignment
        fields = ['id', 'student_id', 'student', 'status', 'assigned_date',
                  'teacher_feedback', 'task_title', 'grade', 'time_spent', 'is_late', 'late_due_date']


class TaskSubmissionSerializer(serializers.ModelSerializer):
    """
    Serializer for task submissions by students.
    """
    student_name = serializers.CharField(source='assignment.student.username', read_only=True)
    task_title = serializers.CharField(source='assignment.task.title', read_only=True)
    status = serializers.CharField(source='assignment.status', read_only=True)

    class Meta:
        model = TaskSubmission
        fields = ['id', 'student_name', 'task_title', 'submission_date', 'status', 'comments']
        read_only_fields = ['id', 'submission_date', 'student_name', 'task_title', 'status']


class TaskFileSerializer(serializers.ModelSerializer):
    """
    Serializer for handling task-related files.
    """
    class Meta:
        model = TaskFile
        fields = ['file', 'file_name']


class TaskSerializer(serializers.ModelSerializer):
    """
    Serializer for creating and managing tasks by teachers.
    """
    assigned_by = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Task
        fields = ['id', 'title', 'description', 'deadline', 'assigned_by']

    def create(self, validated_data: dict) -> Task:
        """
        Creates a task and handles associated file uploads.

        @param validated_data: Data for creating a task instance.
        @return: A newly created task instance.
        """
        request = self.context.get('request')
        files = validated_data.pop('files', None)
        validated_data['assigned_by'] = request.user

        task = super().create(validated_data)

        if files:
            for file in files:
                TaskFile.objects.create(task=task, file=file)

        return task


class TaskSubmissionDetailSerializer(serializers.ModelSerializer):
    """
    Serializer for detailed task submission data.
    """
    student_name = serializers.CharField(source='assignment.student.username', read_only=True)
    task_title = serializers.CharField(source='assignment.task.title', read_only=True)
    submitted_files = SubmissionFileSerializer(many=True, source='files', read_only=True)

    class Meta:
        model = TaskSubmission
        fields = ['student_name', 'task_title', 'submission_date', 'comments', 'submitted_files']
        read_only_fields = ['student_name', 'task_title', 'submission_date', 'submitted_files']
