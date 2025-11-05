from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    email = models.EmailField(unique=True)  # email must be unique
    username = models.CharField(max_length=150, blank=True, null=True, unique=False) 

    ROLE_CHOICES = (
        ('student', 'Student'),
        ('teacher', 'Teacher'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='student')

    USERNAME_FIELD = 'email'   # login with email
    REQUIRED_FIELDS = ['username']       # don’t require username

    def __str__(self):
        return f"{self.email} - {self.role}"
