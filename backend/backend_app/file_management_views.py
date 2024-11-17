"""
API views for managing tasks and assignments in the backend application.

This module includes views for:
- Task submissions by students
- Task creation and management by teachers
- Extending due dates and managing task assignments
- List and manage task submissions for teachers.
- Extend due dates for task assignments.
- Grade student submissions and provide feedback.
"""

from django.utils import timezone
from django.utils.dateparse import parse_datetime
from rest_framework import status
from rest_framework.exceptions import PermissionDenied
from rest_framework.generics import get_object_or_404
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser

from backend_app.models import (
    Task, TaskAssignment, SubmissionFile, TaskSubmission,
    Course, TaskFile, MyUser
)
from backend_app.serializers import (
    TaskSubmissionSerializer, TaskSerializer, TaskAssignmentSerializer,
    SubmissionFileSerializer, TaskFileSerializer, TaskSubmissionDetailSerializer
)
from backend_app.services import send_system_message_new_assignment, send_system_message_assignment_graded


class TaskSubmissionView(APIView):
    parser_classes = [MultiPartParser]

    def get(self, request: object, task_id: int) -> Response:
        """
        Fetch task details and submission status for a specific task assignment.

        @param request: The HTTP request object.
        @param task_id: The ID of the task being queried.
        @return: Response containing task details and submission data.
        """
        user = request.user
        task = get_object_or_404(Task, id=task_id)
        task_assignment = get_object_or_404(TaskAssignment, task=task_id, student=user)

        task_serializer = TaskSerializer(task)
        task_assignment_serializer = TaskAssignmentSerializer(task_assignment)
        task_files = TaskFile.objects.filter(task=task)
        task_files_serializer = TaskFileSerializer(task_files, many=True)

        if task_assignment.status == TaskAssignment.Status.SUBMITTED:
            submission = TaskSubmission.objects.filter(assignment=task_assignment).first()
            if not submission:
                return Response({"message": "No submission found for this assignment."},
                                status=status.HTTP_404_NOT_FOUND)
            submission_files = SubmissionFile.objects.filter(submission=submission)
            submission_serializer = SubmissionFileSerializer(submission_files, many=True)
            return Response({
                "task_details": task_serializer.data,
                "assignment_details": task_assignment_serializer.data,
                "task_files": task_files_serializer.data,
                "submitted_files": submission_serializer.data
            }, status=status.HTTP_200_OK)

        return Response({
            "task_details": task_serializer.data,
            "assignment_details": task_assignment_serializer.data,
            "task_files": task_files_serializer.data
        }, status=status.HTTP_200_OK)

    def post(self, request: object, task_id: int) -> Response:
        """
        Submit an assignment for a specific task by a student.

        @param request: The HTTP request object containing submission data.
        @param task_id: The ID of the task being submitted.
        @return: Response with the submission data or an error message.
        """
        task = get_object_or_404(Task, id=task_id)
        student = request.user
        assignment = get_object_or_404(TaskAssignment, task=task, student=student)

        if assignment.status == TaskAssignment.Status.SUBMITTED:
            return Response({"error": "Task already submitted."}, status=status.HTTP_400_BAD_REQUEST)

        serializer = TaskSubmissionSerializer(data=request.data)
        if serializer.is_valid():
            submission = serializer.save(assignment=assignment)
            assignment.status = TaskAssignment.Status.SUBMITTED
            assignment.is_late = timezone.now() > task.deadline
            assignment.save()

            if 'files' in request.FILES:
                for file in request.FILES.getlist('files'):
                    SubmissionFile.objects.create(submission=submission, file_name=file.name, file=file)

            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TaskListCreateView(APIView):
    parser_classes = [MultiPartParser]

    def get(self, request: object, course_id: int) -> Response:
        """
        Retrieve all tasks for a specific course.

        @param request: The HTTP request object.
        @param course_id: The ID of the course whose tasks are to be retrieved.
        @return: Response containing a list of tasks.
        """
        course = get_object_or_404(Course, id=course_id)
        tasks = Task.objects.filter(course=course)
        serializer = TaskSerializer(tasks, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request: object, course_id: int) -> Response:
        """
        Create a new task for a course and assign it to all students.

        @param request: The HTTP request object containing task data.
        @param course_id: The ID of the course where the task is created.
        @return: Response with the created task data or an error message.
        """
        course = get_object_or_404(Course, id=course_id)
        if request.user.role != 'Teacher':
            raise PermissionDenied("Only teachers can create tasks.")

        serializer = TaskSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            task = serializer.save(course=course)

            if 'files' in request.FILES:
                for file in request.FILES.getlist('files'):
                    TaskFile.objects.create(task=task, file_name=file.name, file=file)

            students = course.students.filter(role=MyUser.Role.STUDENT)
            task_assignments = [TaskAssignment(task=task, student=student) for student in students]
            TaskAssignment.objects.bulk_create(task_assignments)

            try:
                send_system_message_new_assignment(request, course_id, task.id)
            except Exception:
                return Response({'error': 'Error while sending system notification e-mails'},
                                status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request: object, task_id: int) -> Response:
        """
        Update details of an existing task.

        @param request: The HTTP request object containing updated task data.
        @param task_id: The ID of the task to be updated.
        @return: Response with the updated task data or an error message.
        """
        task = get_object_or_404(Task, id=task_id)
        if request.user != task.course.teacher:
            raise PermissionDenied("Only the course teacher can edit tasks.")

        serializer = TaskSerializer(task, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request: object, task_id: int) -> Response:
        """
        Delete a task.

        @param request: The HTTP request object.
        @param task_id: The ID of the task to be deleted.
        @return: Response indicating success or an error message.
        """
        task = get_object_or_404(Task, id=task_id)
        if request.user != task.course.teacher:
            raise PermissionDenied("Only the course teacher can delete tasks.")
        task.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


######################################################################################################
#                                    Teacher Grading submission                                      #
######################################################################################################


class TaskSubmissionsView(APIView):

    def get(self, request: object, task_id: int) -> Response:
        """
        Retrieve all task assignments for a specific task.

        @param request: The HTTP request object.
        @param task_id: The ID of the task whose assignments are to be retrieved.
        @return: Response containing a list of task assignments.
        """
        task_assignments = TaskAssignment.objects.filter(task_id=task_id).select_related('student')
        task_assignments_serializer = TaskAssignmentSerializer(task_assignments, many=True)
        return Response({"submissions": task_assignments_serializer.data}, status=status.HTTP_200_OK)

    def patch(self, request: object, task_id: int, assignment_id: int) -> Response:
        """
        Extend the due date of a task assignment.

        @param request: The HTTP request object containing the new due date.
        @param task_id: The ID of the task to which the assignment belongs.
        @param assignment_id: The ID of the task assignment to update.
        @return: Response with the updated due date or an error message.
        """
        new_due_date = request.data.get('late_due_date')
        if not new_due_date:
            return Response({"error": "late_due_date is required."}, status=status.HTTP_400_BAD_REQUEST)

        parsed_due_date = parse_datetime(new_due_date)
        if not parsed_due_date:
            return Response({"error": "Invalid date format. Use ISO 8601 format (YYYY-MM-DDTHH:MM:SSZ)."},
                            status=status.HTTP_400_BAD_REQUEST)

        assignment = get_object_or_404(TaskAssignment, id=assignment_id)
        assignment.late_due_date = parsed_due_date
        assignment.is_late = True
        assignment.save()

        return Response({"message": "Due date successfully extended.", "new_due_date": assignment.late_due_date},
                        status=status.HTTP_200_OK)

    def delete(self, request: object, task_id: int, assignment_id: int) -> Response:
        """
        Unassign a task from a student by deleting the task assignment.

        @param request: The HTTP request object.
        @param task_id: The ID of the task to which the assignment belongs.
        @param assignment_id: The ID of the task assignment to delete.
        @return: Response indicating success or an error message.
        """
        assignment = get_object_or_404(TaskAssignment, id=assignment_id)
        assignment.delete()
        return Response({"message": "Task successfully unassigned."}, status=status.HTTP_204_NO_CONTENT)


class GradeSubmissionView(APIView):

    def get(self, request: object, task_id: int, student_id: int) -> Response:
        """
        Retrieve submission details for grading.

        @param request: The HTTP request object.
        @param task_id: The ID of the task associated with the submission.
        @param student_id: The ID of the student who submitted the assignment.
        @return: Response containing submission details or an error message.
        """
        task = get_object_or_404(Task, id=task_id)
        task_assignment = get_object_or_404(TaskAssignment, task=task, student=student_id)
        task_submission = get_object_or_404(TaskSubmission, assignment=task_assignment)

        serializer = TaskSubmissionDetailSerializer(task_submission)
        return Response({
            "submission": serializer.data,
            "teacher_feedback": task_assignment.teacher_feedback or None,
            "grade": task_assignment.grade or None,
        }, status=status.HTTP_200_OK)

    def post(self, request: object, task_id: int, student_id: int) -> Response:
        """
        Grade a submission by creating a new grade entry.

        @param request: The HTTP request object containing grade and feedback data.
        @param task_id: The ID of the task associated with the submission.
        @param student_id: The ID of the student whose submission is being graded.
        @return: Response indicating success or an error message.
        """
        return self._handle_grading(request, task_id, student_id)

    def put(self, request: object, task_id: int, student_id: int) -> Response:
        """
        Update an existing grade for a submission.

        @param request: The HTTP request object containing updated grade and feedback data.
        @param task_id: The ID of the task associated with the submission.
        @param student_id: The ID of the student whose grade is being updated.
        @return: Response indicating success or an error message.
        """
        return self._handle_grading(request, task_id, student_id)

    def _handle_grading(self, request: object, task_id: int, student_id: int) -> Response:
        """
        Handle grading for a task submission.

        @param request: The HTTP request object containing grade and feedback data.
        @param task_id: The ID of the task associated with the submission.
        @param student_id: The ID of the student whose submission is being graded.
        @return: Response indicating success or an error message.
        """
        task = get_object_or_404(Task, id=task_id)
        task_assignment = get_object_or_404(TaskAssignment, task=task, student=student_id)

        grade = request.data.get('grade')
        feedback = request.data.get('teacher_feedback')

        if not grade or not feedback:
            return Response({'error': 'Grade and feedback are required.'}, status=status.HTTP_400_BAD_REQUEST)

        task_assignment.grade = grade
        task_assignment.teacher_feedback = feedback
        task_assignment.status = TaskAssignment.Status.GRADED
        task_assignment.save()

        try:
            send_system_message_assignment_graded(request, task_assignment.id)
        except Exception:
            return Response({'error': 'Error while sending system notification e-mails.'},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({'success': 'Submission graded successfully!'}, status=status.HTTP_200_OK)
