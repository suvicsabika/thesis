# Generated by Django 5.0.3 on 2024-10-04 16:35

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('backend_app', '0018_rename_personal_notes_taskassignment_student_personal_notes_and_more'),
    ]

    operations = [
        migrations.RenameField(
            model_name='taskassignment',
            old_name='student_personal_notes',
            new_name='personal_notes',
        ),
    ]