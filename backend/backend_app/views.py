"""
API views for user authentication, course management, and profile handling.

This module includes:
- User registration and login
- JWT token handling via cookies
- Course creation by teachers
- User profile retrieval and shared course validation
- Course-related operations such as listing, retrieving details, and managing participants.
- Announcements and related comments or reactions.
- User-specific announcements and associated metadata.
- Student-specific grade retrieval
- Teacher-specific course overviews
- CRUD operations for courses and subjects
- Managing comments and reactions for announcements
"""
from django.contrib.auth import authenticate
from django.db.models import Avg, F, Value
from django.db.models.functions import Concat
from django.shortcuts import get_object_or_404
from rest_framework.exceptions import PermissionDenied
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.views import TokenRefreshView

from .serializers import (
    UserSerializer, CourseSerializer, AnnouncementSerializer, TaskSerializer,
    CommentSerializer, ReactionSerializer, SubjectSerializer, GetCoursesSerializer
)
from .models import MyUser, Course, Task, Announcement, Comment, Reaction, Subject, TaskAssignment
from .services import send_system_message_new_announcement


class UserRegistrationView(APIView):
    """
    Handles user registration.
    """
    permission_classes = [AllowAny]

    def post(self, request: object) -> Response:
        """
        Register a new user.

        @param request: The HTTP request containing user data.
        @return: Response with user data or error messages.
        """
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            if 'profile_picture' in request.FILES:
                user.profile_picture = request.FILES['profile_picture']
                user.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserLoginView(APIView):
    """
    Handles user login and token generation.
    """
    permission_classes = [AllowAny]

    def post(self, request: object) -> Response:
        """
        Authenticate the user and set JWT tokens in cookies.

        @param request: The HTTP request containing login credentials.
        @return: Response with success message or error message.
        """
        username = request.data.get('username')
        password = request.data.get('password')

        user = authenticate(username=username, password=password)
        if user:
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            refresh_token = str(refresh)

            response = Response({'message': 'Token sent successfully'}, status=status.HTTP_200_OK)
            response.set_cookie('access_token', access_token, httponly=True, secure=False, samesite='Lax', max_age=3600)
            response.set_cookie('refresh_token', refresh_token, httponly=True, secure=False, samesite='Lax',
                                max_age=86400 * 7)
            return response

        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


class CookieTokenRefreshView(TokenRefreshView):
    """
    Refresh JWT tokens using the refresh token stored in cookies.
    """

    def post(self, request: object, *args, **kwargs) -> Response:
        """
        Refresh the access token.

        @param request: The HTTP request containing the refresh token in cookies.
        @return: Response with the new access token or error message.
        """
        refresh_token = request.COOKIES.get('refresh_token')
        if refresh_token:
            request.data['refresh'] = refresh_token
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            access_token = response.data.get('access')
            response.set_cookie('access_token', access_token, httponly=True, secure=False, samesite='Lax',
                                max_age=3600)
        return response


class UserLoginInfoView(APIView):
    """
    Retrieve logged-in user information.
    """

    def get(self, request: object) -> Response:
        """
        Get information about the authenticated user.

        @param request: The HTTP request object.
        @return: Response with user details or an error message.
        """
        user = request.user
        if user.is_authenticated:
            return Response({
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'role': user.role,
                'fullname': user.get_full_name()
            })
        return Response({'error': 'User not authenticated'}, status=401)


class UserLogoutView(APIView):
    """
    Log out the authenticated user.
    """

    def post(self, request: object) -> Response:
        """
        Log out the user and delete JWT cookies.

        @param request: The HTTP request object.
        @return: Response with a logout success message.
        """
        response = Response({'message': 'Logged out successfully'})
        response.delete_cookie('access_token')
        response.delete_cookie('refresh_token')
        return response


class CourseCreateView(APIView):
    """
    Allows teachers to create courses.
    """

    def post(self, request: object) -> Response:
        """
        Create a new course if the user is a teacher.

        @param request: The HTTP request containing course data.
        @return: Response with course details or an error message.
        """
        user = request.user
        if user.role != MyUser.Role.TEACHER:
            return Response({'error': 'Only teachers can create courses'}, status=status.HTTP_403_FORBIDDEN)

        serializer = CourseSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            course = serializer.save()
            return Response({'message': 'Course created successfully', 'course': serializer.data},
                            status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(APIView):
    """
    Retrieve user profiles, validating shared course relationships.
    """

    def get(self, request: object, user_id: int) -> Response:
        """
        Retrieve a user's profile if they share a course with the request user.

        @param request: The HTTP request object.
        @param user_id: The ID of the user whose profile is being retrieved.
        @return: Response with profile details or an error message.
        """
        profile_owner = get_object_or_404(MyUser, id=user_id)

        if request.user.role == "Student":
            user_courses = request.user.enrolled_courses.all()
        else:
            user_courses = Course.objects.filter(teacher=request.user)

        if profile_owner.role == "Student":
            profile_owner_courses = profile_owner.enrolled_courses.all()
        else:
            profile_owner_courses = Course.objects.filter(teacher=profile_owner)

        shared_courses = user_courses.filter(id__in=profile_owner_courses.values_list('id', flat=True))

        if shared_courses.exists() or request.user == profile_owner:
            serializer = GetCoursesSerializer(profile_owner_courses, many=True)
            profile_data = {
                'id': profile_owner.id,
                'fullname': profile_owner.get_full_name(),
                'email': profile_owner.email,
                'role': profile_owner.role,
                'courses': serializer.data,
                'profile_picture': profile_owner.profile_picture.url if profile_owner.profile_picture else None
            }
            return Response(profile_data, status=status.HTTP_200_OK)

        return Response({'detail': 'You are not authorized to view this profile.'}, status=403)


class CoursesView(APIView):
    """
    Retrieve courses for the logged-in user based on their role.
    """

    def get(self, request: object) -> Response:
        """
        Get all courses for a student or teacher.

        @param request: The HTTP request object.
        @return: Response containing courses and the user role or an error message.
        """
        user = request.user

        if user.role == 'Student':
            courses = user.enrolled_courses.all().order_by('subject__name')
            serializer = GetCoursesSerializer(courses, many=True, context={'request': request})
            return Response({'role': 'Student', 'courses': serializer.data})

        elif user.role == 'Teacher':
            courses = Course.objects.filter(teacher=user).order_by('subject__name')
            serializer = GetCoursesSerializer(courses, many=True)
            return Response({'role': 'Teacher', 'courses': serializer.data})

        return Response({'error': 'Invalid role or no courses found'}, status=400)


class CourseDetailView(APIView):
    """
    Retrieve detailed information for a specific course.
    """

    def get(self, request: object, course_id: int) -> Response:
        """
        Retrieve details of a specific course including tasks and metadata.

        @param request: The HTTP request object.
        @param course_id: The ID of the course to retrieve.
        @return: Response containing course details, tasks, and metadata.
        """
        course = get_object_or_404(Course, id=course_id)

        if course.teacher != request.user and not course.students.filter(id=request.user.id).exists():
            return Response({'error': 'You do not have permission to view this course.'}, status=403)

        course_data = CourseSerializer(course).data
        teacher_name = course.teacher.get_full_name()
        subject_name = course.subject.name
        tasks = Task.objects.filter(course=course).order_by('deadline')
        task_data = TaskSerializer(tasks, many=True).data

        return Response({
            'course': course_data,
            'tasks': task_data,
            'teacher_name': teacher_name,
            'subject_name': subject_name,
        })


class CourseParticipantsView(APIView):
    """
    Retrieve or manage participants in a specific course.
    """

    def get(self, request: object, course_id: int) -> Response:
        """
        Retrieve participants (teacher and students) for a specific course.

        @param request: The HTTP request object.
        @param course_id: The ID of the course to retrieve participants for.
        @return: Response containing teacher and student details or an error message.
        """
        course = get_object_or_404(Course, id=course_id)
        teacher = course.teacher
        students = course.students.all()

        teacher_data = {'id': teacher.id, 'name': teacher.get_full_name()}
        students_data = [{'id': student.id, 'name': student.get_full_name()} for student in students]

        return Response({'teacher': teacher_data, 'students': students_data})

    def delete(self, request: object, course_id: int, student_id: int) -> Response:
        """
        Remove a student from a specific course.

        @param request: The HTTP request object.
        @param course_id: The ID of the course.
        @param student_id: The ID of the student to remove.
        @return: Response indicating success or an error message.
        """
        course = get_object_or_404(Course, id=course_id)
        student = get_object_or_404(MyUser, id=student_id)

        if student not in course.students.all():
            return Response({'error': 'Student not enrolled in this course'}, status=status.HTTP_400_BAD_REQUEST)

        course.students.remove(student)
        return Response({'message': 'Student removed from course successfully'}, status=status.HTTP_204_NO_CONTENT)


class CourseView(APIView):
    """
    API for managing courses with CRUD operations for teachers.

    Used for creating, retrieving, updating, and deleting courses.
    """

    def post(self, request: object) -> Response:
        """
        Create a new course.

        @param request: The HTTP request containing course data.
        @return: Response with the created course or error messages.
        """
        if request.user.role != 'Teacher':
            raise PermissionDenied("Only teachers can create courses.")
        serializer = CourseSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request: object, course_id: int = None) -> Response:
        """
        Retrieve a single course by ID or list all courses.

        @param request: The HTTP request object.
        @param course_id: The ID of the course to retrieve. If None, list all courses.
        @return: Response with course details or a list of courses.
        """
        if course_id:
            course = get_object_or_404(Course, id=course_id)
            serializer = CourseSerializer(course)
            return Response(serializer.data, status=status.HTTP_200_OK)

        courses = Course.objects.all()
        serializer = CourseSerializer(courses, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request: object, course_id: int) -> Response:
        """
        Update a course by ID.

        @param request: The HTTP request containing updated course data.
        @param course_id: The ID of the course to update.
        @return: Response with the updated course or error messages.
        """
        course = get_object_or_404(Course, id=course_id)
        if request.user != course.teacher:
            raise PermissionDenied("You do not have permission to edit this course.")

        serializer = CourseSerializer(course, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request: object, course_id: int) -> Response:
        """
        Delete a course by ID.

        @param request: The HTTP request object.
        @param course_id: The ID of the course to delete.
        @return: Response indicating success or error messages.
        """
        course = get_object_or_404(Course, id=course_id)
        if request.user != course.teacher:
            raise PermissionDenied("You do not have permission to delete this course.")

        course.delete()
        return Response({"message": "Course deleted successfully."}, status=status.HTTP_204_NO_CONTENT)


class CourseAnnouncementsView(APIView):
    """
    Manage announcements for a specific course.
    """

    def get(self, request: object, course_id: int) -> Response:
        """
        Retrieve all announcements, comments, and reactions for a course.

        @param request: The HTTP request object.
        @param course_id: The ID of the course.
        @return: Response containing announcements, comments, and reactions.
        """
        course = get_object_or_404(Course, id=course_id)

        announcements = Announcement.objects.filter(course=course).order_by("-date")
        comments = Comment.objects.filter(announcement__in=announcements)
        reactions = Reaction.objects.filter(announcement__in=announcements)

        announcement_data = AnnouncementSerializer(announcements, many=True).data
        comment_data = CommentSerializer(comments, many=True).data
        reaction_data = ReactionSerializer(reactions, many=True).data

        return Response({
            'announcements': announcement_data,
            'comments': comment_data,
            'reactions': reaction_data,
        })

    def post(self, request: object, course_id: int) -> Response:
        """
        Create a new announcement for a course.

        @param request: The HTTP request containing announcement data.
        @param course_id: The ID of the course.
        @return: Response containing the created announcement or an error message.
        """
        course = get_object_or_404(Course, id=course_id)
        title = request.data.get('title')
        content = request.data.get('content')

        if not title or not content:
            return Response({'error': 'Title and content are required'}, status=status.HTTP_400_BAD_REQUEST)

        announcement = Announcement.objects.create(
            course=course,
            user=request.user,
            title=title,
            content=content
        )

        announcement_data = AnnouncementSerializer(announcement).data

        try:
            send_system_message_new_announcement(request, course_id, announcement.id)
        except Exception:
            return Response({'error': 'Error while sending system notification e-mails'},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(announcement_data, status=status.HTTP_201_CREATED)


class UserAnnouncementsView(APIView):
    """
    Retrieve all announcements created by a specific user.
    """

    def get(self, request: object, user_id: int) -> Response:
        """
        Retrieve announcements, comments, and reactions for a specific user.

        @param request: The HTTP request object.
        @param user_id: The ID of the user whose announcements are retrieved.
        @return: Response containing announcements, comments, and reactions.
        """
        user = get_object_or_404(MyUser, id=user_id)

        announcements = Announcement.objects.filter(user=user)
        comments = Comment.objects.filter(announcement__in=announcements)
        reactions = Reaction.objects.filter(announcement__in=announcements)

        announcement_data = AnnouncementSerializer(announcements, many=True).data
        comment_data = CommentSerializer(comments, many=True).data
        reaction_data = ReactionSerializer(reactions, many=True).data

        return Response({
            'announcements': announcement_data,
            'comments': comment_data,
            'reactions': reaction_data,
        })


class StudentGradesView(APIView):
    """
    Retrieve grades for a student, grouped by course.
    """

    def get(self, request: object) -> Response:
        """
        Get the grades of the authenticated student, grouped by course and teacher.

        @param request: The HTTP request object.
        @return: Response containing grouped grades and the average grade.
        """
        user = request.user

        if user.role != MyUser.Role.STUDENT:
            return Response(
                {'error': 'Only students can access their grades'},
                status=status.HTTP_403_FORBIDDEN
            )

        task_grades = TaskAssignment.objects.filter(
            student=user, status='Graded'
        ).annotate(
            task_title=F('task__title'),
            course_subject=F('task__course__subject__name'),
            teacher_name=Concat(
                F('task__course__teacher__first_name'), Value(' '), F('task__course__teacher__last_name')
            )
        ).values('course_subject', 'teacher_name', 'task_title', 'grade')

        average_task_grade = TaskAssignment.objects.filter(
            student=user, status='Graded'
        ).aggregate(avg_grade=Avg('grade'))['avg_grade']

        grouped_task_grades = {}
        for task in task_grades:
            course_key = f"{task['course_subject']}|{task['teacher_name']}"
            if course_key not in grouped_task_grades:
                grouped_task_grades[course_key] = {
                    'course_subject': task['course_subject'],
                    'teacher_name': task['teacher_name'],
                    'tasks': []
                }
            grouped_task_grades[course_key]['tasks'].append({
                'task_title': task['task_title'],
                'grade': task['grade']
            })

        grouped_task_grades_list = list(grouped_task_grades.values())

        return Response({
            'task_grades': grouped_task_grades_list,
            'average_task_grade': average_task_grade
        }, status=status.HTTP_200_OK)


class TeacherCourseOverviewView(APIView):
    """
    Retrieve course overview and student grades for teachers.
    """

    def get(self, request: object, course_id: int) -> Response:
        """
        Get a detailed course overview, including student grades.

        @param request: The HTTP request object.
        @param course_id: The ID of the course.
        @return: Response containing student grades and course details.
        """
        user = request.user

        if user.role != 'Teacher':
            return Response({'error': 'Only teachers can access this information'}, status=403)

        course = Course.objects.filter(id=course_id, teacher=user).first()
        if not course:
            return Response({'error': 'You are not authorized to view this course'}, status=403)

        students = course.students.filter(role=MyUser.Role.STUDENT)
        student_usernames = students.values_list('username', flat=True)

        student_task_grades = (
            TaskAssignment.objects.filter(
                task__course=course, grade__isnull=False, student__username__in=student_usernames
            ).select_related('student', 'task').values(
                'student__username', 'student__first_name', 'student__last_name',
                'student__id', 'task__title', 'grade'
            )
        )

        student_grades = {}
        for entry in student_task_grades:
            username = entry['student__username']
            full_name = f"{entry['student__first_name']} {entry['student__last_name']}"
            if username not in student_grades:
                student_grades[username] = {
                    'full_name': full_name,
                    'tasks': [],
                    'average_grade': None
                }
            student_grades[username]['tasks'].append({
                'task_title': entry['task__title'],
                'grade': entry['grade']
            })

        for username, details in student_grades.items():
            grades = [task['grade'] for task in details['tasks']]
            if grades:
                details['average_grade'] = round(sum(grades) / len(grades), 2)

        return Response({'student_grades': student_grades})


class SubjectListCreateView(APIView):
    """
    Manage subjects for teachers, including listing and creation.
    """

    def get(self, request: object) -> Response:
        """
        List all subjects ordered by a specified field.

        @param request: The HTTP request object.
        @return: Response containing the list of subjects.
        """
        if request.user.role != 'Teacher':
            raise PermissionDenied("Only teachers can access subjects.")

        order_by_field = request.query_params.get('order_by_field', 'grade')
        subjects = Subject.objects.order_by(order_by_field).all()
        serializer = SubjectSerializer(subjects, many=True)
        return Response(serializer.data)

    def post(self, request: object) -> Response:
        """
        Create a new subject.

        @param request: The HTTP request containing subject data.
        @return: Response with the created subject or error messages.
        """
        if request.user.role != 'Teacher':
            raise PermissionDenied("Only teachers can create subjects.")

        serializer = SubjectSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CommentCreateView(APIView):
    """
    Manage comments on announcements.
    """

    def get(self, request: object, announcement_id: int) -> Response:
        """
        Retrieve all comments for a specific announcement.

        @param request: The HTTP request object.
        @param announcement_id: The ID of the announcement.
        @return: Response containing the list of comments.
        """
        announcement = get_object_or_404(Announcement, id=announcement_id)
        comments = announcement.comments.all()
        serializer = CommentSerializer(comments, many=True)
        return Response({"comments": serializer.data})

    def post(self, request: object, announcement_id: int) -> Response:
        """
        Add a comment to a specific announcement.

        @param request: The HTTP request containing comment data.
        @param announcement_id: The ID of the announcement.
        @return: Response with the created comment or error messages.
        """
        announcement = get_object_or_404(Announcement, id=announcement_id)
        serializer = CommentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(announcement=announcement, user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ReactionCreateView(APIView):
    """
    Manage reactions on announcements.
    """

    def get(self, request: object, announcement_id: int) -> Response:
        """
        Retrieve all reactions for a specific announcement.

        @param request: The HTTP request object.
        @param announcement_id: The ID of the announcement.
        @return: Response containing the list of reactions.
        """
        announcement = get_object_or_404(Announcement, id=announcement_id)
        reactions = announcement.reactions.all()
        serializer = ReactionSerializer(reactions, many=True)
        return Response({"reactions": serializer.data})

    def post(self, request: object, announcement_id: int) -> Response:
        """
        Add or update a reaction on a specific announcement.

        @param request: The HTTP request containing reaction data.
        @param announcement_id: The ID of the announcement.
        @return: Response with the created/updated reaction or error messages.
        """
        announcement = get_object_or_404(Announcement, id=announcement_id)
        existing_reaction = announcement.reactions.filter(user=request.user).first()

        if existing_reaction:
            serializer = ReactionSerializer(existing_reaction, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        else:
            serializer = ReactionSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(announcement=announcement, user=request.user)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
