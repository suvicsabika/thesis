"""
Views for managing e-mail sendings.

This module provides API endpoints for sending and accepting invitations
to join a course. The views include:
- Resetting password.
- Sending a password-recovery email.
- Sending an invitation email to a potential student.
- Accepting an invitation and adding the student to the course.
"""
from django.core.mail import send_mail
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from .models import Course, Invitation, MyUser, PasswordResetToken
from .services import send_email_with_context


class PasswordResetUserRequestView(APIView):
    permission_classes = [AllowAny]
    def post(self, request: object) -> Response:
        """
        Sending a password reset request to given MyUser via email.

        @param request: The HTTP request object containing user data and email details.
        @return: Response indicating the reset email was sent successfully.
        """
        email = request.data.get('email')
        if not email:
            return Response({'error': 'Email is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = get_object_or_404(MyUser, email=email)
            token = PasswordResetToken.objects.create(user=user, token=PasswordResetToken.generate_token())
            reset_link = f"{settings.FRONTEND_URL}/reset-password/{token.token}"

            send_mail(
                subject="Password Reset Request",
                message=f"Dear User,\nClick the link to reset your password: {reset_link}\nBest Regards,\nEdusys, Edusys, cloud education system (noreply)",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
            )
            return Response({'message': 'Password reset instructions have been sent to your email.'})
        except:
            return Response({'message': 'If the email exists, instructions have been sent.'}, status=status.HTTP_200_OK)


class PasswordResetUserConfirmView(APIView):
    permission_classes = [AllowAny]
    def post(self, request: object, token: str) -> Response:
        """
        Sending a password reset request to given MyUser via email.

        @param request: The HTTP request object containing user data and email details.
        @param token: The 64 length long str reset token.
        @return: Response indicating the reset was successfull.
        """
        new_password = request.data.get('password')
        if not new_password:
            return Response({'error': 'Password is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            reset_token = get_object_or_404(PasswordResetToken, token=token)

            if not reset_token.is_valid():
                return Response({'error': 'Token has expired.'}, status=status.HTTP_400_BAD_REQUEST)

            user = reset_token.user
            user.set_password(new_password)
            user.save()

            reset_token.delete()

            return Response({'message': 'Password has been reset successfully.'})
        except:
            return Response({'error': 'Invalid or expired token.'}, status=status.HTTP_400_BAD_REQUEST)


class SendInvitationView(APIView):

    def post(self, request: object, course_id: int) -> Response:
        """
        Handles POST requests to send a course invitation.

        @param request: The HTTP request object containing user data and email details.
        @param course_id: The ID of the course for which the invitation is being sent.
        @return: Response indicating the invitation was sent successfully.
        """
        user = request.user
        email: str = request.data.get("email")
        course = get_object_or_404(Course, id=course_id, teacher=user)

        invitation = Invitation.objects.create(email=email, course=course)

        invitation_link: str = f"{settings.FRONTEND_URL}/accept-invitation/{invitation.token}/"

        context: dict = {
            "course_name": course.subject.name,
            "teacher_name": user.get_full_name(),
            "link": invitation_link,
        }

        send_email_with_context(
            subject=f"Invitation to join the course: {course.subject.name}",
            template_name="invitation_template.html",
            context=context,
            recipient_list=[email],
        )

        return Response({"message": "Invitation sent successfully."}, status=status.HTTP_200_OK)


class AcceptInvitationView(APIView):
    def get(self, request: object, token: str) -> Response:
        """
        Handles GET requests to accept a course invitation.

        @param request: The HTTP request object.
        @param token: The unique token associated with the invitation.
        @return: Response with a redirect URL to the course page.
        """
        invitation = get_object_or_404(Invitation, token=token, accepted=False)

        student, created = MyUser.objects.get_or_create(email=invitation.email)

        invitation.course.students.add(student)
        invitation.accepted = True
        invitation.save()

        course_url: str = f"/course/{invitation.course.id}"

        return Response({"redirect_url": course_url}, status=status.HTTP_200_OK)
