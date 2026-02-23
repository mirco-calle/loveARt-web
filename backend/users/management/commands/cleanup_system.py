import os
from datetime import timedelta
from django.core.management.base import BaseCommand
from django.core.management import call_command
from django.utils import timezone
from django.contrib.auth.models import User

class Command(BaseCommand):
    help = "Cleanup expired JWT tokens and unverified users (is_active=False)."

    def add_arguments(self, parser):
        parser.add_argument(
            '--days', 
            type=int, 
            default=1,
            help='Delete unverified users older than this many days (default: 1)'
        )

    def handle(self, *args, **options):
        days = options['days']
        self.stdout.write(self.style.NOTICE("🚀 Starting system cleanup..."))

        # 1. Cleanup JWT Tokens and Sessions
        self.stdout.write("🧹 Cleaning up expired JWT tokens and sessions...")
        try:
            # SimpleJWT: Blacklisted and Outstanding tokens
            call_command("flushexpiredtokens")
            # Django: Expired session data
            call_command("clearsessions")
            self.stdout.write(self.style.SUCCESS("✅ Expired JWT tokens and sessions cleaned."))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"❌ Error during token/session cleanup: {e}"))

        # 2. Cleanup Unverified Users
        # Users who joined but never verified their email (is_active=False)
        self.stdout.write(f"👥 Cleaning up unverified users older than {days} day(s)...")
        limit = timezone.now() - timedelta(days=days)
        unverified_users = User.objects.filter(
            is_active=False, 
            date_joined__lt=limit
        )
        count = unverified_users.count()
        
        if count > 0:
            # Note: CASCADE will also delete their Profile and VerificationCode
            unverified_users.delete()
            self.stdout.write(self.style.SUCCESS(f"✅ Deleted {count} unverified users."))
        else:
            self.stdout.write(self.style.NOTICE("ℹ️ No unverified users to cleanup."))

        self.stdout.write(self.style.SUCCESS("✨ Cleanup process finished."))
