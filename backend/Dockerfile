# Dockerfile for Django Backend

# Use an official Python runtime as a parent image
FROM python:3.12

# Set the working directory in the container
WORKDIR /backend

# Copy the requirements file into the container
COPY requirements.txt /backend/

# Install any dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the current directory contents into the container at /backend
COPY . /backend/

# Make port 8000 available to the world outside this container
EXPOSE 8000

# Define environment variable
#ENV DJANGO_SETTINGS_MODULE=myproject.settings

# Run the Django server
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
