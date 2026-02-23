"""
Management command to authorize Gmail API access for sending emails.

Usage inside the Django container:
    python manage.py setup_gmail_oauth

This is a ONE-TIME setup. It will:
1. Print an authorization URL
2. You open it in your browser and authorize
3. Google redirects to http://localhost?code=XXXX (browser shows error — that's OK)
4. You copy the FULL URL from your browser's address bar and paste it here
5. The command extracts the code, exchanges it for a refresh token, and saves it to .env
"""

import os
import re
from urllib.parse import urlparse, parse_qs

from django.core.management.base import BaseCommand
from django.conf import settings

import requests as http_requests


# Only need permission to send emails
SCOPES = ['https://www.googleapis.com/auth/gmail.send']

GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
REDIRECT_URI = 'http://localhost'


class Command(BaseCommand):
    help = 'One-time OAuth2 setup to get a Gmail refresh token for sending emails.'

    def handle(self, *args, **options):
        client_id = os.environ.get('GOOGLE_OAUTH_CLIENT_ID') or getattr(settings, 'GMAIL_CLIENT_ID', '')
        client_secret = os.environ.get('GOOGLE_OAUTH_CLIENT_SECRET') or getattr(settings, 'GMAIL_CLIENT_SECRET', '')

        if not client_id or not client_secret:
            self.stderr.write(self.style.ERROR(
                'Missing GOOGLE_OAUTH_CLIENT_ID or GOOGLE_OAUTH_CLIENT_SECRET in environment'
            ))
            return

        # Build the authorization URL manually (no deprecated oob flow)
        auth_params = {
            'client_id': client_id,
            'redirect_uri': REDIRECT_URI,
            'response_type': 'code',
            'scope': ' '.join(SCOPES),
            'access_type': 'offline',
            'prompt': 'consent',
        }
        auth_url = f"{GOOGLE_AUTH_URL}?" + '&'.join(f'{k}={v}' for k, v in auth_params.items())

        self.stdout.write('\n' + '=' * 70)
        self.stdout.write(self.style.SUCCESS('GMAIL OAUTH SETUP'))
        self.stdout.write('=' * 70)
        self.stdout.write('\n1. Open this URL in your browser:\n')
        self.stdout.write(self.style.WARNING(f'\n{auth_url}\n'))
        self.stdout.write('\n2. Sign in with your Gmail account (mirkex.guitar@gmail.com)')
        self.stdout.write('3. Click "Allow" to grant send permission')
        self.stdout.write('4. Google will redirect to http://localhost?code=XXXX')
        self.stdout.write('   The page will show an ERROR — that\'s NORMAL!')
        self.stdout.write('5. Copy the FULL URL from your browser\'s address bar\n')

        user_input = input('\nPaste the full redirect URL (or just the code): ').strip()

        # Extract the authorization code
        code = self._extract_code(user_input)
        if not code:
            self.stderr.write(self.style.ERROR(
                'Could not extract authorization code. '
                'Make sure you copied the full URL from the address bar.'
            ))
            return

        # Exchange the code for tokens
        try:
            token_data = {
                'code': code,
                'client_id': client_id,
                'client_secret': client_secret,
                'redirect_uri': REDIRECT_URI,
                'grant_type': 'authorization_code',
            }
            resp = http_requests.post(GOOGLE_TOKEN_URL, data=token_data)
            resp.raise_for_status()
            tokens = resp.json()
        except Exception as e:
            self.stderr.write(self.style.ERROR(f'Error exchanging code for tokens: {e}'))
            if hasattr(e, 'response') and e.response is not None:
                self.stderr.write(self.style.ERROR(f'Response: {e.response.text}'))
            return

        refresh_token = tokens.get('refresh_token')
        if not refresh_token:
            self.stderr.write(self.style.ERROR(
                'No refresh_token received. '
                'Try revoking access at https://myaccount.google.com/permissions '
                'and run this command again.'
            ))
            return

        self.stdout.write('\n' + '=' * 70)
        self.stdout.write(self.style.SUCCESS('✓ Authorization successful!'))
        self.stdout.write('=' * 70)

        # Try to auto-write to .env
        env_path = os.path.normpath(os.path.join(settings.BASE_DIR, '..', '.env'))

        if os.path.exists(env_path):
            with open(env_path, 'r') as f:
                content = f.read()

            if 'GMAIL_REFRESH_TOKEN=' in content:
                # Update existing line
                content = re.sub(
                    r'GMAIL_REFRESH_TOKEN=.*',
                    f'GMAIL_REFRESH_TOKEN={refresh_token}',
                    content,
                )
            else:
                content = content.rstrip() + f'\nGMAIL_REFRESH_TOKEN={refresh_token}\n'

            with open(env_path, 'w') as f:
                f.write(content)

            self.stdout.write(self.style.SUCCESS(
                f'\n✓ GMAIL_REFRESH_TOKEN saved to {env_path}'
            ))
            self.stdout.write(self.style.WARNING(
                '\nRestart Docker for changes to take effect:\n'
                '  docker compose down && docker compose up -d\n'
            ))
        else:
            self.stdout.write(self.style.WARNING(
                f'\n.env not found at {env_path}\n'
                f'Add this manually:\n\n'
                f'GMAIL_REFRESH_TOKEN={refresh_token}\n'
            ))

    @staticmethod
    def _extract_code(user_input):
        """Extract the authorization code from a URL or raw code string."""
        # If the user pasted a full URL like http://localhost?code=4/xxx&scope=...
        if user_input.startswith('http'):
            parsed = urlparse(user_input)
            params = parse_qs(parsed.query)
            codes = params.get('code', [])
            return codes[0] if codes else None

        # If the user pasted just the code
        if user_input and len(user_input) > 10:
            return user_input

        return None
