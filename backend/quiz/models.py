
import string
import random
from django.db import models
from accounts.models import User  # assuming teacher = user with role='teacher'

def generate_unique_code():
    while True:
        code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
        if not Quiz.objects.filter(code=code).exists():
                return code


class Quiz(models.Model):
    teacher = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'role': 'teacher'})
    title = models.CharField(max_length=255)
    code = models.CharField(max_length=6, unique=True, default=generate_unique_code)
    timer = models.PositiveIntegerField(default=600)  # total time for quiz in seconds
    total_questions = models.PositiveIntegerField(default=10)  # just a number
    created_at = models.DateTimeField(auto_now_add=True)

class Question(models.Model):
    quiz = models.ForeignKey(Quiz, related_name='questions', on_delete=models.CASCADE)
    text = models.TextField()
    option_a = models.CharField(max_length=255)
    option_b = models.CharField(max_length=255)
    option_c = models.CharField(max_length=255)
    option_d = models.CharField(max_length=255)
    correct_option = models.CharField(max_length=1, choices=[('A', 'A'), ('B', 'B'), ('C', 'C'), ('D', 'D')])
