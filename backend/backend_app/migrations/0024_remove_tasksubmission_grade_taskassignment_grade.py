# Generated by Django 5.0.3 on 2024-10-22 20:59

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('backend_app', '0023_remove_submissionfile_s3_bucket_key_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='tasksubmission',
            name='grade',
        ),
        migrations.AddField(
            model_name='taskassignment',
            name='grade',
            field=models.PositiveIntegerField(blank=True, null=True),
        ),
    ]
