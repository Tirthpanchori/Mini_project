from .models import User
from rest_framework.permissions import AllowAny
from rest_framework import generics
from .serializers import UserSerializer
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView


class CreateUserView(generics.CreateAPIView):
    """
    Signup view for creating new users (students or teachers).
    Expects: username, email, password, role ('student' or 'teacher').
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]  # Allow anyone to create an account


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        
        # If role is stored directly on the User model
        if hasattr(self.user, "role"):
            data['role'] = self.user.role
        
        # If role is stored in a related Profile model (OneToOne with User)
        elif hasattr(self.user, "profile") and hasattr(self.user.profile, "role"):
            data['role'] = self.user.profile.role

        return data


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer
