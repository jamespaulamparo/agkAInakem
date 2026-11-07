"""
Optional accounts. Everything on the site works without one; an account only lets the
journal follow the person across devices. Session cookies + CSRF, no third-party auth.
"""
from django.contrib.auth import authenticate, login, logout, password_validation
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework import serializers
from rest_framework.authentication import SessionAuthentication
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle

from apps.journal.api import EntrySerializer


def _check_csrf(request):
    # DRF only enforces CSRF for already-authenticated sessions; enforce it for login/register too.
    SessionAuthentication().enforce_csrf(request)


def _me(user):
    if not user.is_authenticated:
        return {'authenticated': False, 'user': None}
    return {'authenticated': True, 'user': {'name': user.first_name or user.email.split('@')[0], 'email': user.email,
                                            'joined': user.date_joined.date().isoformat()}}


class RegisterSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=60, required=False, allow_blank=True)
    email = serializers.EmailField(max_length=150)
    password = serializers.CharField(min_length=8, max_length=128, write_only=True)

    def validate_email(self, value):
        value = value.lower().strip()
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError('An account with this email already exists.')
        return value

    def validate(self, attrs):
        try:
            password_validation.validate_password(attrs['password'], User(username=attrs['email'], email=attrs['email']))
        except ValidationError as e:
            raise serializers.ValidationError({'password': list(e.messages)})
        return attrs


@api_view(['GET'])
@ensure_csrf_cookie
def me(request):
    return Response(_me(request.user))


@api_view(['POST'])
@throttle_classes([ScopedRateThrottle])
def register(request):
    _check_csrf(request)
    s = RegisterSerializer(data=request.data)
    s.is_valid(raise_exception=True)
    d = s.validated_data
    user = User.objects.create_user(username=d['email'], email=d['email'], password=d['password'], first_name=d.get('name', ''))
    login(request, user)
    return Response(_me(user), status=201)


@api_view(['POST'])
@throttle_classes([ScopedRateThrottle])
def login_view(request):
    _check_csrf(request)
    email = str(request.data.get('email', '')).lower().strip()
    user = authenticate(request, username=email, password=request.data.get('password', ''))
    if not user:
        return Response({'detail': 'Email or password is incorrect.'}, status=400)
    login(request, user)
    return Response(_me(user))


@api_view(['POST'])
def logout_view(request):
    logout(request)
    return Response(_me(request.user))


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def export(request):
    """Everything we store about the person, as JSON."""
    return Response({'account': _me(request.user)['user'],
                     'journal': EntrySerializer(request.user.journal_entries.all(), many=True).data})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def delete_account(request):
    """Permanently delete the account and every journal entry. Requires the password."""
    if not request.user.check_password(request.data.get('password', '')):
        return Response({'detail': 'Password is incorrect.'}, status=400)
    user = request.user
    logout(request)
    user.delete()
    return Response({'deleted': True})


for _v in (register, login_view):
    _v.cls.throttle_scope = 'auth'
