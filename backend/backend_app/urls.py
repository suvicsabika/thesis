"""
Defining all the endpoints of the backend application.

All the endpoints are connected to their corresponding APIViews.
Warning: Do not delete TokenRefreshView from the imports, it is a silent endpoint without any custom implementation.
"""

from django.urls import path

from .email_management_views import SendInvitationView, AcceptInvitationView, \
    PasswordResetUserRequestView, PasswordResetUserConfirmView
from .file_management_views import TaskSubmissionView, TaskSubmissionsView, TaskListCreateView, GradeSubmissionView
from .views import UserRegistrationView, UserLoginView, UserProfileView, \
    CourseDetailView, CourseParticipantsView, \
    UserAnnouncementsView, CourseAnnouncementsView, StudentGradesView, \
    CoursesView, UserLoginInfoView, SubjectListCreateView, CookieTokenRefreshView, UserLogoutView, \
    CourseView, \
    TeacherCourseOverviewView, CommentCreateView, ReactionCreateView, CourseCreateView, \
    TokenRefreshView  # Important! Do not to delete.

urlpatterns = [
    path('api/register/', UserRegistrationView.as_view(), name='user-registration'),
    path('api/token/refresh/', CookieTokenRefreshView.as_view(), name='token_refresh'),
    path('api/token/', UserLoginView.as_view(), name='token_obtain'),
    path('api/logout/', UserLogoutView.as_view(), name='user-logout'),
    path('api/get-user-login/', UserLoginInfoView.as_view(), name='get-user-login'),

    path('password-reset/', PasswordResetUserRequestView.as_view(), name='password_reset_request'),
    path('password-reset-confirm/<str:token>/', PasswordResetUserConfirmView.as_view(), name='password_reset_confirm'),

    path('api/get-user-profile/<int:user_id>/', UserProfileView.as_view(), name='get-user-profile'),
    path('api/user/get-announcements/<int:user_id>', UserAnnouncementsView.as_view(), name='user-announcements'),
    path('api/create-course/', CourseCreateView.as_view(), name='create-course'),

    path('api/courses/get-courses/', CoursesView.as_view(), name='get-courses'),
    path('api/courses-detailed/<int:course_id>/', CourseDetailView.as_view(), name='course-detail'),
    path('api/course/<int:course_id>/participants/', CourseParticipantsView.as_view(), name='course_participants'),
    path('api/course/<int:course_id>/participants/<int:student_id>/', CourseParticipantsView.as_view(),
         name='course_participants'),
    path('api/course-announcements/<int:course_id>/', CourseAnnouncementsView.as_view(), name='course-announcements'),
    path('api/courses/<int:course_id>/', CourseView.as_view(), name='courses-crud'),
    path('api/subjects/', SubjectListCreateView.as_view(), name='subject-list-create'),

    path('api/courses/<int:course_id>/tasks/', TaskListCreateView.as_view(), name='task-list-create'),
    path('api/tasks-update-delete/<int:task_id>/', TaskListCreateView.as_view(), name='task-update-delete'),

    path('api/student-grades/', StudentGradesView.as_view(), name='student-grades'),

    path('api/courses/<int:course_id>/overview/', TeacherCourseOverviewView.as_view(), name='teacher-course-overview'),

    path('api/announcements/<int:announcement_id>/comments/', CommentCreateView.as_view(), name='create-comment'),
    path('api/announcements/<int:announcement_id>/reactions/', ReactionCreateView.as_view(), name='create-reaction'),

    path('api/tasks/<int:task_id>/', TaskSubmissionView.as_view(), name='task-detail'),
    path('api/student-submit-files/<int:task_id>/', TaskSubmissionView.as_view(), name='student-submit-files'),

    path('api/tasks/<int:task_id>/submissions/', TaskSubmissionsView.as_view(), name='task-submissions'),
    path('api/tasks/<int:task_id>/submissions/<int:assignment_id>/', TaskSubmissionsView.as_view(),
         name='assignment-patch-delete'),
    path('api/grade-submission/<int:task_id>/<int:student_id>/', GradeSubmissionView.as_view(),
         name='grade-submission'),

    path("api/send-invitation/<int:course_id>/", SendInvitationView.as_view(), name="send-invitation"),
    path("api/accept-invitation/<uuid:token>/", AcceptInvitationView.as_view(), name="accept-invitation"),
]
