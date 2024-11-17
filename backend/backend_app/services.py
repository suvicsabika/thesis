"""
Custom on-demand services.

There was a need to calculate custom file paths, so I created a generic path creating functions.
Furthermore, the generic e-mail sending functions are also located in this module.
"""
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.utils.text import slugify
from rest_framework import status
from rest_framework.generics import get_object_or_404
from rest_framework.response import Response

from backend_project import settings


def user_submission_directory_path(instance: object, filename: str) -> str:
    """
    Constructs a file path for user submissions based on the assignment and username.

    @param instance: The instance of the model where the file is being uploaded.
    @param filename: The name of the uploaded file.
    @returns: str: The constructed file path for the user submission.
    """
    username = instance.submission.assignment.student.username
    task_title = instance.submission.assignment.task.title
    task_title_slug = slugify(task_title)
    return f'submissions/{username}/{task_title_slug}/{filename}'


def task_files_directory_path(instance: object, filename: str) -> str:
    """
    Constructs a file path for user submissions based on the assignment and username.

    @param instance: The instance of the model where the file is being uploaded.
    @param filename: The name of the uploaded file.
    @return: The constructed file path for the user submission.
    """
    task_title = instance.task.title
    task_title_slug = slugify(task_title)
    return f'tasks/{task_title_slug}/{filename}'


def send_email_with_context(subject: str, recipient_list: list[str], template_name: str, context: str) -> None:
    """
    Sends an email with a rendered HTML template.

    @param subject: The subject line of the email.
    @param recipient_list: A list of recipient email addresses.
    @param template_name: The template file name for rendering the email content.
    @param context: The data context passed to the template for rendering.

    @raises ValueError: If the recipient list is empty.
    @returns: None
    """
    from backend_app.models import MyUser

    to_user = MyUser.objects.filter(email = recipient_list[0]).first()
    if to_user.email == "example@gmail.com":
        return

    html_content = render_to_string(template_name, context)
    plain_message = strip_tags(html_content)

    send_mail(
        subject=subject,
        message=plain_message,
        html_message=html_content,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=recipient_list,
    )


def send_system_message_new_assignment(request: object, course_id: int, task_id: int) -> Response:
    """
    System e-mail alert about new assignment to all students associated with the given Course.

    @param request: HTTP request
    @param course_id: Given Course's ID
    @param task_id: The new Task's ID
    @return: Response: A success response indicating the notification was sent.
    """
    from backend_app.models import Course, Task  # Local import to avoid circular import

    user = request.user
    course = get_object_or_404(Course, id=course_id)
    task = get_object_or_404(Task, id=task_id)

    students = course.students.all()

    # Prepare the context for the email
    context = {
        "course_name": course.subject.name,
        "teacher_name": user.get_full_name(),
        "assignment_title": task.title,
        "deadline": task.deadline,
        "link": f"{settings.FRONTEND_URL}/task/{task.id}"
    }

    for student in students:
        send_email_with_context(
            subject=f"New Assignment: {task.title} in {course.subject.name}",
            template_name="assignment_notification_template.html",
            context=context,
            recipient_list=[student.email],
        )

    return Response({"message": "Notifications sent successfully."}, status=status.HTTP_200_OK)


def send_system_message_new_announcement(request: object, course_id: int, announcement_id: int) -> Response:
    """
    System e-mail alert about new announcement to all students associated with the given Course.

    @param request: HTTP request
    @param course_id: Given Course's ID
    @param announcement_id: The new Announcement's ID
    @return: Response: A success response indicating the notification was sent.
    """

    from backend_app.models import Course, Announcement  # Local import to avoid circular import

    user = request.user
    course = get_object_or_404(Course, id=course_id)
    announcement = get_object_or_404(Announcement, id=announcement_id, course=course)

    students = course.students.all()

    context = {
        "course_name": course.subject.name,
        "announcement_title": announcement.title,
        "announcement_content": announcement.content,
        "teacher_name": user.get_full_name(),
        "date": announcement.date,
        "link": f"{settings.FRONTEND_URL}/course/{course.id}"
    }

    for student in students:
        send_email_with_context(
            subject=f"New Announcement in {course.subject.name}: {announcement.title}",
            template_name="announcement_notification_template.html",
            context=context,
            recipient_list=[student.email],
        )

    return Response({"message": "Announcement notifications sent successfully."}, status=status.HTTP_200_OK)


def send_system_message_assignment_graded(request: object, assignment_id: int) -> Response:
    """
    System e-mail alert about new assignment grade to a student associated with the given Assignment.

    @param request: HTTP request
    @param assignment_id: The Assignment's ID
    @return: Response: A success response indicating the notification was sent.
    """
    from backend_app.models import TaskAssignment  # Local import to avoid circular import

    assignment = get_object_or_404(TaskAssignment, id=assignment_id)
    task = assignment.task
    course = task.course
    student = assignment.student
    teacher = task.assigned_by

    context = {
        "course_name": course.subject.name,
        "assignment_title": task.title,
        "grade": assignment.grade,
        "teacher_name": teacher.get_full_name(),
        "teacher_feedback": assignment.teacher_feedback,
        "link": f"{settings.FRONTEND_URL}/task/{task.id}"
    }

    send_email_with_context(
        subject=f"Graded: {task.title} in {course.subject.name}",
        template_name="graded_assignment_notification_template.html",
        context=context,
        recipient_list=[student.email],
    )

    return Response({"message": "Graded assignment notification sent successfully."}, status=status.HTTP_200_OK)
