from rest_framework import serializers
from .models import Attempt

class AttemptSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attempt
        fields = ['id', 'title', 'code', 'attempted_at', 'score']
        read_only_fields = ['id','title','score','code', 'attempted_at']
