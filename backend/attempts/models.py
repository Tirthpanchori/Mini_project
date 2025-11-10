from django.db import models
from accounts.models import User
from quiz.models import Quiz, Question  # if you have a Question model

class Attempt(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'role': 'student'})
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name="attempts")
    score = models.FloatField()
    attempted_at = models.DateTimeField(auto_now_add=True)

    # def __str__(self):
    #     return f"{self.student.username} - {self.quiz.title} ({self.score})"

class SavedAnswer(models.Model):
    attempt = models.ForeignKey(Attempt, on_delete=models.CASCADE, related_name='saved_answers')
    question = models.ForeignKey(Question, on_delete=models.CASCADE)  # or question_id = models.IntegerField()
    selected_option = models.CharField(max_length=1, choices=[('A', 'A'), ('B', 'B'), ('C', 'C'), ('D', 'D')])

    # def __str__(self):
    #     return f"Attempt {self.attempt.id} - Q{self.question_id}: {self.selected_option}"
