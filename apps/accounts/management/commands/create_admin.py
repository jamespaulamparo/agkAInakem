"""
Create (or reset) a Django admin account without the interactive prompts.

    python manage.py create_admin --username pc --password password

Skips password-strength checks on purpose (demo use). Change it before the site is public.
"""
from django.contrib.auth.models import User
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = 'Create or reset a superuser (demo convenience; skips password-strength checks)'

    def add_arguments(self, parser):
        parser.add_argument('--username', required=True)
        parser.add_argument('--password', required=True)
        parser.add_argument('--email', default='')
        parser.add_argument('--if-missing', action='store_true', help='Do nothing if the user already exists')

    def handle(self, *args, username, password, email, if_missing=False, **opts):
        if if_missing and User.objects.filter(username=username).exists():
            return
        user, created = User.objects.get_or_create(username=username, defaults={'email': email})
        user.is_staff = True
        user.is_superuser = True
        user.is_active = True
        user.set_password(password)
        user.save()
        self.stdout.write(self.style.SUCCESS(f"{'Created' if created else 'Updated'} admin '{username}'. Log in at /admin/"))
        self.stdout.write(self.style.WARNING('This is a weak demo password. Change it before sharing the site publicly.'))
