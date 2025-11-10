from rest_framework import serializers
from .models import Attempt, SavedAnswer

class AttemptSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attempt
        fields = ['id', 'quiz', 'score', 'attempted_at']
        read_only_fields = ['id', 'quiz', 'score', 'attempted_at']


