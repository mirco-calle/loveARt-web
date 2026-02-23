"""
Custom Django email backend that sends via Gmail API using OAuth2.
Same mechanism as n8n's Gmail node — no SMTP, no App Password needed.

Requires in settings.py / .env:
    GMAIL_CLIENT_ID     → GOOGLE_OAUTH_CLIENT_ID
    GMAIL_CLIENT_SECRET → GOOGLE_OAUTH_CLIENT_SECRET
    GMAIL_REFRESH_TOKEN → obtained once via: python manage.py setup_gmail_oauth
"""

import base64
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from django.conf import settings
from django.core.mail.backends.base import BaseEmailBackend

from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError


GMAIL_SCOPES = ['https://www.googleapis.com/auth/gmail.send']


class GmailOAuthBackend(BaseEmailBackend):
    """
    Sends email via Gmail REST API with OAuth2.
    Access tokens are refreshed automatically using the stored refresh token.
    """

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._service = None

    def _get_service(self):
        if self._service:
            return self._service

        client_id = getattr(settings, 'GMAIL_CLIENT_ID', None)
        client_secret = getattr(settings, 'GMAIL_CLIENT_SECRET', None)
        refresh_token = getattr(settings, 'GMAIL_REFRESH_TOKEN', None)

        if not all([client_id, client_secret, refresh_token]):
            raise RuntimeError(
                '[GmailOAuthBackend] Missing credentials. '
                'Run: python manage.py setup_gmail_oauth'
            )

        creds = Credentials(
            token=None,
            refresh_token=refresh_token,
            client_id=client_id,
            client_secret=client_secret,
            token_uri='https://oauth2.googleapis.com/token',
            scopes=GMAIL_SCOPES,
        )

        # Auto-refresh access token if expired
        if not creds.valid:
            creds.refresh(Request())

        self._service = build('gmail', 'v1', credentials=creds, cache_discovery=False)
        return self._service

    def send_messages(self, email_messages):
        """Send each EmailMessage object via Gmail API."""
        if not email_messages:
            return 0

        try:
            service = self._get_service()
        except Exception as e:
            if not self.fail_silently:
                raise
            print(f'[GmailOAuthBackend] Service init failed: {e}')
            return 0

        sent_count = 0
        for message in email_messages:
            try:
                mime_msg = self._build_mime(message)
                raw = base64.urlsafe_b64encode(mime_msg.as_bytes()).decode('utf-8')
                service.users().messages().send(
                    userId='me',
                    body={'raw': raw},
                ).execute()
                sent_count += 1
                print(f'[Gmail API] ✓ Sent to: {", ".join(message.to)}')
            except HttpError as e:
                print(f'[Gmail API] ✗ HttpError: {e}')
                if not self.fail_silently:
                    raise
            except Exception as e:
                print(f'[Gmail API] ✗ Unexpected error: {e}')
                if not self.fail_silently:
                    raise

        return sent_count

    @staticmethod
    def _build_mime(message):
        """Convert Django EmailMessage to MIME object."""
        if message.alternatives:
            # HTML email
            mime = MIMEMultipart('alternative')
            mime.attach(MIMEText(message.body, 'plain', 'utf-8'))
            for content, mimetype in message.alternatives:
                mime.attach(MIMEText(content, mimetype.split('/')[-1], 'utf-8'))
        else:
            mime = MIMEText(message.body, 'plain', 'utf-8')

        mime['to'] = ', '.join(message.to)
        mime['subject'] = message.subject
        mime['from'] = message.from_email or settings.DEFAULT_FROM_EMAIL

        if message.cc:
            mime['cc'] = ', '.join(message.cc)
        if message.reply_to:
            mime['reply-to'] = ', '.join(message.reply_to)

        return mime
