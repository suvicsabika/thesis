# Generated by Django 5.0.3 on 2024-10-04 16:51

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('backend_app', '0019_rename_student_personal_notes_taskassignment_personal_notes'),
    ]

    operations = [
        migrations.AddField(
            model_name='task',
            name='assigned_by',
            field=models.ForeignKey(default=1, limit_choices_to={'role': 'Teacher'}, on_delete=django.db.models.deletion.PROTECT, to=settings.AUTH_USER_MODEL),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='taskassignment',
            name='student',
            field=models.ForeignKey(limit_choices_to={'role': 'Student'}, on_delete=django.db.models.deletion.PROTECT, to=settings.AUTH_USER_MODEL),
        ),
    ]