# Generated by Django 5.0.3 on 2024-09-20 14:44

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('backend_app', '0015_alter_course_students_alter_task_course'),
    ]

    operations = [
        migrations.DeleteModel(
            name='CourseMaterial',
        ),
    ]