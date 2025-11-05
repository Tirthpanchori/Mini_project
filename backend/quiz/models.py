import string
import random
from django.db import models
from accounts.models import User  # assuming teacher = user with role='teacher'

def generate_unique_code():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

class Quiz(models.Model):
    teacher = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'role': 'teacher'})
    title = models.CharField(max_length=255)
    code = models.CharField(max_length=6, unique=True, default=generate_unique_code)
    created_at = models.DateTimeField(auto_now_add=True)
