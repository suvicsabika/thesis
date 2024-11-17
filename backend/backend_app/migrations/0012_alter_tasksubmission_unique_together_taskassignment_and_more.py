# Generated by Django 5.0.3 on 2024-09-15 08:53

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('backend_app', '0011_announcement_user'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='tasksubmission',
            unique_together=set(),
        ),
        migrations.CreateModel(
            name='TaskAssignment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('assigned_date', models.DateTimeField(auto_now_add=True)),
                ('status', models.CharField(choices=[('Pending', 'Pending'), ('Submitted', 'Submitted'), ('Graded', 'Graded'), ('Overdue', 'Overdue')], default='Pending', max_length=10)),
                ('student', models.ForeignKey(limit_choices_to={'role': 'Student'}, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
                ('task', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='backend_app.task')),
            ],
            options={
                'unique_together': {('task', 'student')},
            },
        ),
        migrations.AddField(
            model_name='tasksubmission',
            name='assignment',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, to='backend_app.taskassignment'),
            preserve_default=False,
        ),
        migrations.RemoveField(
            model_name='tasksubmission',
            name='status',
        ),
        migrations.RemoveField(
            model_name='tasksubmission',
            name='student',
        ),
        migrations.RemoveField(
            model_name='tasksubmission',
            name='task',
        ),
    ]
