from django.db import models
from accounts.models import User  # assuming student = user with role='student'
from quiz.models import Quiz


class Attempt(models.Model):
    student = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        limit_choices_to={'role': 'student'}
    )
    score = models.FloatField()
    code = models.ForeignKey(
        Quiz,
        on_delete=models.CASCADE,
        related_name="attempts_by_code"
    )
    title = models.ForeignKey(
        Quiz,
        on_delete=models.CASCADE,
        related_name="attempts_by_title"
    )
    attempted_at = models.DateTimeField(auto_now_add=True)