# Generated by Django 5.0.3 on 2024-10-22 21:50

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('backend_app', '0024_remove_tasksubmission_grade_taskassignment_grade'),
    ]

    operations = [
        migrations.AddField(
            model_name='myuser',
            name='profile_picture',
            field=models.ImageField(blank=True, null=True, upload_to='profiles/'),
        ),
    ]