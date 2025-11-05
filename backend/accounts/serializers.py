from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'password', 'role']
        read_only_fields = ['id']
        extra_kwargs = {
            'email': {'required': True},
            'username': {'required': False},  # optional now
            # we will see can we make username  True for future
        }

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            username=validated_data.get('username', None),
            password=validated_data['password'],
            role=validated_data.get('role', 'student')
        )
        return user
