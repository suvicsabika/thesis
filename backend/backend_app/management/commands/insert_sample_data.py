from django.core.management.base import BaseCommand
from backend_app.models import (
    MyUser, Subject, Course, Task, TaskFile, TaskAssignment,
    TaskSubmission, SubmissionFile, Announcement, Reaction, Comment, Invitation
)
from django.utils.timezone import now, timedelta
from uuid import uuid4


class Command(BaseCommand):
    help = 'Insert sample data into the database'

    def handle(self, *args, **kwargs):
        # Create Users
        teacher = MyUser.objects.create_user(
            username="teacher1",
            first_name="Jane",
            last_name="Doe",
            email="teacher1@example.com",
            password="password123",
            role=MyUser.Role.TEACHER
        )
        student1 = MyUser.objects.create_user(
            username="student1",
            first_name="John",
            last_name="Smith",
            email="student1@example.com",
            password="password123",
            role=MyUser.Role.STUDENT
        )
        student2 = MyUser.objects.create_user(
            username="student2",
            first_name="Emily",
            last_name="Clark",
            email="student2@example.com",
            password="password123",
            role=MyUser.Role.STUDENT
        )
        self.stdout.write(f"Created users: {teacher}, {student1}, {student2}")

        # Create Subjects
        math_subject = Subject.objects.create(name="Math", grade=10, category="Science")
        science_subject = Subject.objects.create(name="Science", grade=11, category="STEM")
        self.stdout.write(f"Created subjects: {math_subject}, {science_subject}")

        # Create Courses
        math_course = Course.objects.create(
            subject=math_subject,
            teacher=teacher,
            description="Learn advanced mathematics.",
            schedule=now(),
            room="101"
        )
        science_course = Course.objects.create(
            subject=science_subject,
            teacher=teacher,
            description="Explore the wonders of science.",
            schedule=now(),
            room="102"
        )
        math_course.students.add(student1, student2)
        self.stdout.write(f"Created courses: {math_course}, {science_course}")

        # Create Tasks
        math_task = Task.objects.create(
            course=math_course,
            title="Algebra Homework",
            description="Solve all algebra problems in Chapter 3.",
            deadline=now() + timedelta(days=7),
            assigned_by=teacher
        )
        science_task = Task.objects.create(
            course=science_course,
            title="Science Experiment",
            description="Complete the lab report on photosynthesis.",
            deadline=now() + timedelta(days=10),
            assigned_by=teacher
        )
        self.stdout.write(f"Created tasks: {math_task}, {science_task}")

        # Create Task Assignments
        math_assignment = TaskAssignment.objects.create(
            task=math_task,
            student=student1,
            status=TaskAssignment.Status.PENDING
        )
        science_assignment = TaskAssignment.objects.create(
            task=science_task,
            student=student2,
            status=TaskAssignment.Status.PENDING
        )
        self.stdout.write(f"Created task assignments: {math_assignment}, {science_assignment}")

        # Create Task Submissions
        math_submission = TaskSubmission.objects.create(
            assignment=math_assignment,
            comments="Completed with all questions answered."
        )
        self.stdout.write(f"Created task submission: {math_submission}")

        # Create Submission Files
        submission_file = SubmissionFile.objects.create(
            submission=math_submission,
            file_name="algebra_homework.pdf"
        )
        self.stdout.write(f"Created submission file: {submission_file}")

        # Create Announcements
        announcement = Announcement.objects.create(
            course=math_course,
            title="Exam Reminder",
            content="The midterm exam is scheduled for next week.",
            user=teacher
        )
        self.stdout.write(f"Created announcement: {announcement}")

        # Create Reactions
        Reaction.objects.create(
            announcement=announcement,
            user=student1,
            reaction_type="like"
        )
        self.stdout.write(f"Created reactions for announcement: {announcement}")

        # Create Comments
        comment = Comment.objects.create(
            announcement=announcement,
            user=student2,
            content="Thanks for the reminder!"
        )
        self.stdout.write(f"Created comment: {comment}")

        # Create Invitations
        invitation = Invitation.objects.create(
            email="invitee@example.com",
            course=math_course,
            token=uuid4(),
            accepted=False
        )
        self.stdout.write(f"Created invitation: {invitation}")

        self.stdout.write(self.style.SUCCESS("Sample data inserted successfully!"))
