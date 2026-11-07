"""
Optional accounts. Everything on the site works without one; an account only lets the
journal follow the person across devices. Session cookies + CSRF, no third-party auth.
"""
from django.conf import settings
from django.contrib.auth import authenticate, login, logout, password_validation
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
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
from .models import Consent, ResearchConsent

PRIVACY_NOTICE_VERSION = '2026-11-07.2'


def _check_csrf(request):
    # DRF only enforces CSRF for already-authenticated sessions; enforce it for login/register too.
    SessionAuthentication().enforce_csrf(request)


def _me(user):
    if not user.is_authenticated:
        return {'authenticated': False, 'user': None}
    return {'authenticated': True, 'user': {'name': user.first_name or (user.email or user.username).split('@')[0], 'email': user.email,
                                            'joined': user.date_joined.date().isoformat(), 'is_staff': user.is_staff,
                                            'research_opt_in': ResearchConsent.objects.filter(user=user).exists()}}


class RegisterSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=60, required=False, allow_blank=True)
    email = serializers.EmailField(max_length=150)
    password = serializers.CharField(min_length=8, max_length=128, write_only=True)
    consent = serializers.BooleanField()
    age_confirmed = serializers.BooleanField()

    def validate_consent(self, value):
        if not value:
            raise serializers.ValidationError('Please read and agree to the Privacy Notice to create an account.')
        return value

    def validate_age_confirmed(self, value):
        if not value:
            raise serializers.ValidationError('Please confirm you are 18 or older, or have a parent or guardian’s permission.')
        return value

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
    Consent.objects.create(user=user, notice_version=PRIVACY_NOTICE_VERSION, sensitive_data=True, age_confirmed=True)
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
    return Response({
        'exported_at': __import__('django.utils.timezone', fromlist=['now']).now().isoformat(),
        'account': _me(request.user)['user'],
        'consents': [{'privacy_notice_version': c.notice_version, 'sensitive_data': c.sensitive_data,
                      'age_confirmed': c.age_confirmed, 'given_at': c.given_at.isoformat()} for c in request.user.consents.all()],
        'journal': EntrySerializer(request.user.journal_entries.all(), many=True).data,
        'research_consent': (lambda r: {'privacy_notice_version': r.notice_version, 'given_at': r.given_at.isoformat()} if r else None)(
            ResearchConsent.objects.filter(user=request.user).first()),
        'last_login': request.user.last_login.isoformat() if request.user.last_login else None,
    })


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


@api_view(['POST', 'DELETE'])
@permission_classes([IsAuthenticated])
def research(request):
    """Opt in (POST) to or out of (DELETE) anonymous, aggregate research statistics."""
    if request.method == 'POST':
        ResearchConsent.objects.get_or_create(user=request.user, defaults={'notice_version': PRIVACY_NOTICE_VERSION})
    else:
        ResearchConsent.objects.filter(user=request.user).delete()
    return Response(_me(request.user))


@api_view(['POST'])
@throttle_classes([ScopedRateThrottle])
def password_reset(request):
    """
    Email a one-time reset link. Always answers the same way, so it can't be used to find out
    which emails have accounts. In development the email is printed in the server window.
    """
    _check_csrf(request)
    email = str(request.data.get('email', '')).lower().strip()
    user = User.objects.filter(username=email, is_active=True).first()
    if user and user.has_usable_password():
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        link = request.build_absolute_uri(f'/reset/{uid}/{token}')
        send_mail(
            'Reset your agkAInakem password',
            f'Someone asked to reset the password for this email on agkAInakem.\n\n'
            f'Open this link to choose a new password (it works once and expires in a few days):\n{link}\n\n'
            f'If it wasn’t you, ignore this email. Your password stays the same.',
            settings.DEFAULT_FROM_EMAIL, [email], fail_silently=True,
        )
    return Response({'ok': True})


@api_view(['POST'])
@throttle_classes([ScopedRateThrottle])
def password_reset_confirm(request):
    _check_csrf(request)
    try:
        user = User.objects.get(pk=force_str(urlsafe_base64_decode(request.data.get('uid', ''))))
    except (User.DoesNotExist, ValueError, TypeError, OverflowError):
        user = None
    if not user or not default_token_generator.check_token(user, request.data.get('token', '')):
        return Response({'detail': 'This reset link is invalid or has expired. Please ask for a new one.'}, status=400)
    password = request.data.get('password', '')
    try:
        password_validation.validate_password(password, user)
    except ValidationError as e:
        return Response({'password': list(e.messages)}, status=400)
    user.set_password(password)
    user.save()
    login(request, user)
    return Response(_me(user))


for _v in (register, login_view, password_reset, password_reset_confirm):
    _v.cls.throttle_scope = 'auth'
