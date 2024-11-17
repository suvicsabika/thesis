"""
Unittests for models creations.

Testing some of the model's behaviors and their relations when creating new data.
"""

from django.test import TestCase
from .models import (
    MyUser, Subject, Course, Task, TaskFile, TaskAssignment,
    TaskSubmission, Announcement, Reaction, Comment, Invitation
)

class MyUserTestCase(TestCase):
    def setUp(self):
        self.student = MyUser.objects.create_user(
            username="student1",
            first_name="John",
            last_name="Doe",
            email="student1@example.com",
            password="password123",
            role="Student"
        )
        self.teacher = MyUser.objects.create_user(
            username="teacher1",
            first_name="Jane",
            last_name="Smith",
            email="teacher1@example.com",
            password="password123",
            role="Teacher"
        )

    def test_user_creation(self):
        self.assertEqual(self.student.role, "Student")
        self.assertEqual(self.teacher.role, "Teacher")

    def test_user_profile_picture_path(self):
        self.student.profile_picture = "image.jpg"
        self.student.save()
        self.assertIn(f"{self.student.first_name.lower()}_{self.student.last_name.lower()}/image.jpg", self.student.profile_picture.name)


class SubjectTestCase(TestCase):
    def setUp(self):
        self.subject = Subject.objects.create(name="Math", grade=10, category="Science")

    def test_subject_creation(self):
        self.assertEqual(self.subject.name, "Math")
        self.assertEqual(self.subject.grade, 10)
        self.assertEqual(self.subject.category, "Science")

    def test_unique_constraint(self):
        with self.assertRaises(Exception):
            Subject.objects.create(name="Math", grade=10, category="Science")


class CourseTestCase(TestCase):
    def setUp(self):
        self.teacher = MyUser.objects.create_user(username="teacher1", role="Teacher")
        self.subject = Subject.objects.create(name="Physics", grade=12, category="Science")
        self.course = Course.objects.create(subject=self.subject, teacher=self.teacher, room="101")

    def test_course_creation(self):
        self.assertEqual(self.course.teacher.username, "teacher1")
        self.assertEqual(self.course.subject.name, "Physics")
        self.assertEqual(self.course.room, "101")

    def test_student_enrollment(self):
        student = MyUser.objects.create_user(username="student1", role="Student")
        self.course.students.add(student)
        self.assertIn(student, self.course.students.all())


class TaskTestCase(TestCase):
    def setUp(self):
        self.teacher = MyUser.objects.create_user(username="teacher1", role="Teacher")
        self.subject = Subject.objects.create(name="Biology", grade=12, category="Science")
        self.course = Course.objects.create(subject=self.subject, teacher=self.teacher)
        self.task = Task.objects.create(course=self.course, title="Assignment 1", description="Solve the questions", assigned_by=self.teacher)

    def test_task_creation(self):
        self.assertEqual(self.task.title, "Assignment 1")
        self.assertEqual(self.task.course.subject.name, "Biology")


class TaskFileTestCase(TestCase):
    def setUp(self):
        self.teacher = MyUser.objects.create_user(username="teacher1", role=MyUser.Role.TEACHER)
        self.subject = Subject.objects.create(name="Math", grade=10, category="Science")
        self.course = Course.objects.create(subject=self.subject, teacher=self.teacher)
        self.task = Task.objects.create(course=self.course, title="Test Task", assigned_by=self.teacher)
        self.task_file = TaskFile.objects.create(task=self.task, file_name="test_file.txt")

    def test_task_file_creation(self):
        self.assertEqual(self.task_file.task.title, "Test Task")
        self.assertEqual(self.task_file.file_name, "test_file.txt")


class TaskAssignmentTestCase(TestCase):
    def setUp(self):
        self.teacher = MyUser.objects.create_user(username="teacher1", role="Teacher")
        self.student = MyUser.objects.create_user(username="student1", role="Student")
        self.subject = Subject.objects.create(name="Physics", grade=11, category="Science")
        self.course = Course.objects.create(subject=self.subject, teacher=self.teacher)
        self.task = Task.objects.create(course=self.course, title="Homework", assigned_by=self.teacher)
        self.assignment = TaskAssignment.objects.create(task=self.task, student=self.student)

    def test_assignment_creation(self):
        self.assertEqual(self.assignment.status, "Pending")
        self.assertEqual(self.assignment.task.title, "Homework")


class TaskSubmissionTestCase(TestCase):
    def setUp(self):
        # Create a teacher and student user
        self.teacher = MyUser.objects.create_user(
            username="teacher1", first_name="Jane", role=MyUser.Role.TEACHER
        )
        self.student = MyUser.objects.create_user(
            username="student1", first_name="John", role=MyUser.Role.STUDENT
        )

        # Create a subject and course
        self.subject = Subject.objects.create(name="Math", grade=10, category="Science")
        self.course = Course.objects.create(subject=self.subject, teacher=self.teacher)

        # Create a task
        self.task = Task.objects.create(
            course=self.course,
            title="Homework",
            description="Complete the exercises",
            assigned_by=self.teacher
        )

        # Create a task assignment
        self.assignment = TaskAssignment.objects.create(task=self.task, student=self.student)

        # Create a task submission
        self.submission = TaskSubmission.objects.create(assignment=self.assignment)

    def test_submission_creation(self):
        # Validate the submission is linked to the correct task and student
        self.assertEqual(self.submission.assignment.task.title, "Homework")
        self.assertEqual(self.submission.assignment.student.username, "student1")


class AnnouncementTestCase(TestCase):
    def setUp(self):
        self.teacher = MyUser.objects.create_user(username="teacher1", role=MyUser.Role.TEACHER)
        self.subject = Subject.objects.create(name="Biology", grade=11, category="Science")
        self.course = Course.objects.create(subject=self.subject, teacher=self.teacher)
        self.announcement = Announcement.objects.create(course=self.course, title="Important Update", user=self.teacher)

    def test_announcement_creation(self):
        self.assertEqual(self.announcement.title, "Important Update")


class ReactionTestCase(TestCase):
    def setUp(self):
        # Create a teacher and student user
        self.teacher = MyUser.objects.create_user(
            username="teacher1", first_name="Jane", role=MyUser.Role.TEACHER
        )
        self.student = MyUser.objects.create_user(
            username="student1", first_name="John", role=MyUser.Role.STUDENT
        )

        # Create a subject and course
        self.subject = Subject.objects.create(name="Biology", grade=11, category="Science")
        self.course = Course.objects.create(
            subject=self.subject,
            teacher=self.teacher,
            description="A detailed biology course",
            room="Room 101"
        )

        # Create an announcement
        self.announcement = Announcement.objects.create(
            course=self.course,
            title="Important Announcement",
            content="Exam dates announced!",
            user=self.teacher
        )

        # Create a reaction
        self.reaction = Reaction.objects.create(
            announcement=self.announcement,
            user=self.student,
            reaction_type="like"
        )

    def test_reaction_creation(self):
        # Validate the reaction type
        self.assertEqual(self.reaction.reaction_type, "like")
        # Validate the linked announcement and user
        self.assertEqual(self.reaction.announcement.title, "Important Announcement")
        self.assertEqual(self.reaction.user.username, "student1")


class CommentTestCase(TestCase):
    def setUp(self):
        # Create a teacher and student user
        self.teacher = MyUser.objects.create_user(
            username="teacher1", first_name="Jane", role=MyUser.Role.TEACHER
        )
        self.student = MyUser.objects.create_user(
            username="student1", first_name="John", role=MyUser.Role.STUDENT
        )

        # Create a subject and course
        self.subject = Subject.objects.create(name="History", grade=11, category="Humanities")
        self.course = Course.objects.create(subject=self.subject, teacher=self.teacher)

        # Create an announcement
        self.announcement = Announcement.objects.create(
            course=self.course,
            title="Important Update",
            content="Midterm exam schedule announced",
            user=self.teacher
        )

        # Create a comment
        self.comment = Comment.objects.create(
            announcement=self.announcement, user=self.student, content="Great update!"
        )

    def test_comment_creation(self):
        # Validate the comment content
        self.assertEqual(self.comment.content, "Great update!")
        # Validate the user and announcement linking
        self.assertEqual(self.comment.user.username, "student1")
        self.assertEqual(self.comment.announcement.title, "Important Update")

class InvitationTestCase(TestCase):
    def setUp(self):
        # Create a teacher user
        self.teacher = MyUser.objects.create_user(
            username="teacher1", first_name="Jane", role=MyUser.Role.TEACHER
        )

        # Create a subject
        self.subject = Subject.objects.create(name="Physics", grade=12, category="Science")

        # Create a course
        self.course = Course.objects.create(
            subject=self.subject,
            teacher=self.teacher,
            description="Advanced Physics Course",
            room="101"
        )

        # Create an invitation
        self.invitation = Invitation.objects.create(email="invitee@example.com", course=self.course)

    def test_invitation_creation(self):
        # Validate the invitation email
        self.assertEqual(self.invitation.email, "invitee@example.com")
        # Validate the course linkage
        self.assertEqual(self.invitation.course.subject.name, "Physics")
