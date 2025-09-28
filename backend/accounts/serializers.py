from django.contrib.auth.models import User
from rest_framework import serializers
from .models import UserProfile  # Make sure you have this modelr

class UserSerializer(serializers.ModelSerializer):
    role = serializers.ChoiceField(
        choices=[('student', 'Student'), ('teacher', 'Teacher')],
        write_only=True
    )
    password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'role']
        read_only_fields = ['id']
        extra_kwargs = {
            'username': {'required': True},
            'email': {'required': True},
            'password': {'write_only': True, 'required': True},
        }

    def create(self, validated_data):
        # Extract role
        role = validated_data.pop('role')

        # Create user with hashed password
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )

        # Create associated profile with role
        UserProfile.objects.create(user=user, role=role)

        return user

