from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

import requests

from users.api.serializers import (
    RegisterSerializer,
    LoginSerializer,
    UserSerializer,
    ChangePasswordSerializer,
    UserProfileSerializer,
    VerifyEmailSerializer,
    ResendVerificationSerializer,
)
from users.models import UserProfile, EmailVerificationCode, generate_otp


# ============================================
# HELPERS
# ============================================

def get_tokens_for_user(user):
    """Generate JWT access + refresh tokens for a given user."""
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


def send_otp_email(user, code):
    """
    Send OTP verification email using the HTML template.
    Falls back to plain text if template rendering fails.
    """
    user_name = user.first_name or user.username
    verify_url = f"{getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')}/login?view=verify&email={user.email}"

    # Render HTML template
    try:
        html_content = render_to_string('users/email_verification.html', {
            'user_name': user_name,
            'code': code,
            'verify_url': verify_url,
        })
    except Exception as e:
        print(f'[EMAIL] Template render failed, using plain text: {e}')
        html_content = None

    # Plain text fallback
    plain_text = (
        f'Hi {user_name},\n\n'
        f'Your LoveARt verification code is: {code}\n\n'
        f'This code expires in 10 minutes.\n\n'
        f'— The LoveARt Team'
    )

    email = EmailMultiAlternatives(
        subject='LoveARt — Verify Your Account 🚀',
        body=plain_text,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[user.email],
    )

    if html_content:
        email.attach_alternative(html_content, 'text/html')

    email.send(fail_silently=False)



import threading


def create_and_send_otp(user):
    """
    Create (or refresh) an OTP for the user and send it via email.
    Deletes any existing code before creating a new one.
    Returns the generated code.
    """
    EmailVerificationCode.objects.filter(user=user).delete()
    code = generate_otp()
    EmailVerificationCode.objects.create(user=user, code=code)
    
    # Enviar email asíncronamente para evitar que el request tarde de 3-5 segundos
    threading.Thread(target=send_otp_email, args=(user, code)).start()
    
    return code


# ============================================
# AUTH ENDPOINTS
# ============================================

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register_view(request):
    """
    POST /api/users/register/
    Register a new user (is_active=False), auto-create profile,
    and send OTP verification email.
    Returns 201 — user must verify email to get JWT tokens.
    """
    serializer = RegisterSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.save()

    # Send OTP (printed to Django console in development)
    try:
        otp_code = create_and_send_otp(user)
        print(f'[OTP] Code for {user.email}: {otp_code}')  # Always visible in logs
    except Exception as e:
        print(f'[EMAIL ERROR] Could not send OTP to {user.email}: {e}')

    return Response(
        {'detail': 'Account created. Please check your email for the verification code.'},
        status=status.HTTP_201_CREATED,
    )


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def verify_email_view(request):
    """
    POST /api/users/verify-email/
    Verify the 6-digit OTP and activate the user account.
    Returns JWT tokens on success.
    Body: { "email": "...", "code": "123456" }
    """
    serializer = VerifyEmailSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    email = serializer.validated_data['email']
    code = serializer.validated_data['code']

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response(
            {'detail': 'No account found with this email.'},
            status=status.HTTP_404_NOT_FOUND,
        )

    try:
        otp = EmailVerificationCode.objects.get(user=user)
    except EmailVerificationCode.DoesNotExist:
        return Response(
            {'detail': 'No verification code found. Please request a new one.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if not otp.is_valid():
        otp.delete()
        return Response(
            {'detail': 'Verification code has expired. Please request a new one.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if otp.code != code:
        return Response(
            {'detail': 'Incorrect verification code.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Activate user and remove OTP
    user.is_active = True
    user.save()
    otp.delete()

    tokens = get_tokens_for_user(user)
    return Response({
        **tokens,
        'user': UserSerializer(user).data,
        'detail': 'Email verified successfully.',
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def resend_verification_view(request):
    """
    POST /api/users/resend-verification/
    Resend OTP verification email.
    Body: { "email": "..." }
    """
    serializer = ResendVerificationSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    email = serializer.validated_data['email']

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response(
            {'detail': 'No account found with this email.'},
            status=status.HTTP_404_NOT_FOUND,
        )

    if user.is_active:
        return Response(
            {'detail': 'This account is already verified.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        otp_code = create_and_send_otp(user)
        print(f'[OTP RESEND] Code for {user.email}: {otp_code}')
    except Exception as e:
        print(f'[EMAIL ERROR] Resend failed for {email}: {e}')
        return Response(
            {'detail': 'Could not send email. Please try again later.'},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    return Response(
        {'detail': 'Verification code resent. Please check your email.'},
        status=status.HTTP_200_OK,
    )


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_view(request):
    """
    POST /api/users/login/
    Login with username OR email + password, return JWT tokens.
    Blocks unverified users (is_active=False).

    Body: { "identifier": "user@example.com OR username", "password": "..." }
    """
    serializer = LoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    identifier = serializer.validated_data['identifier'].strip()
    password = serializer.validated_data['password']

    # ── Resolve the real username from email or username ──────────────────────
    username_to_auth = identifier  # default: assume it's already a username

    if '@' in identifier:
        # Looks like an email — find the corresponding username
        try:
            db_user = User.objects.get(email__iexact=identifier)
            username_to_auth = db_user.username
        except User.DoesNotExist:
            return Response(
                {'error': 'No account found with this email address.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        except User.MultipleObjectsReturned:
            # Edge case: duplicate emails (shouldn't happen, but handle gracefully)
            return Response(
                {'error': 'Multiple accounts found. Please use your username to log in.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

    # ── Check if account is inactive BEFORE authenticate() ──────────────────
    # Django's ModelBackend.authenticate() silently returns None for inactive
    # users, so we'd never reach a post-auth is_active check. We must detect
    # this case first by looking up the user and checking the password manually.
    try:
        db_user = User.objects.get(username=username_to_auth)
    except User.DoesNotExist:
        db_user = None

    if db_user is not None and not db_user.is_active:
        # Account exists but is not verified — check password before revealing info
        if db_user.check_password(password):
            return Response(
                {
                    'error': 'Please verify your email before logging in.',
                    'email': db_user.email,
                },
                status=status.HTTP_403_FORBIDDEN,
            )
        else:
            # Wrong password — don't reveal that the account exists
            return Response(
                {'error': 'Invalid credentials. Check your username/email and password.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )

    # ── Authenticate (only reaches here for active users or non-existent) ─────
    user = authenticate(username=username_to_auth, password=password)

    if user is None:
        return Response(
            {'error': 'Invalid credentials. Check your username/email and password.'},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    tokens = get_tokens_for_user(user)
    return Response({
        **tokens,
        'user': UserSerializer(user).data,
    })



@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def google_login_view(request):
    """
    POST /api/users/google/
    Receive Google OAuth access_token or credential (JWT), validate it, and return JWT tokens.
    Google users are pre-verified (is_active=True).
    """
    access_token = request.data.get('access_token')
    credential = request.data.get('credential')

    if not access_token and not credential:
        return Response(
            {'error': 'access_token or credential is required.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    email = None
    first_name = ''
    last_name = ''

    if credential:
        from google.oauth2 import id_token
        from google.auth.transport import requests as google_requests
        import os
        try:
            # Verify the JWT token locally (very fast, no extra HTTP request needed initially)
            CLIENT_ID = getattr(settings, 'GOOGLE_OAUTH_CLIENT_ID', os.environ.get('GOOGLE_OAUTH_CLIENT_ID', ''))
            idinfo = id_token.verify_oauth2_token(credential, google_requests.Request(), CLIENT_ID)
            email = idinfo['email']
            first_name = idinfo.get('given_name', idinfo.get('name', ''))
            last_name = idinfo.get('family_name', '')
        except ValueError as e:
            return Response(
                {'error': f'Invalid Google credential: {e}'},
                status=status.HTTP_401_UNAUTHORIZED,
            )
    elif access_token:
        try:
            google_response = requests.get(
                'https://www.googleapis.com/oauth2/v3/userinfo',
                headers={'Authorization': f'Bearer {access_token}'},
                timeout=10,
            )
            if google_response.status_code != 200:
                return Response(
                    {'error': 'Invalid Google token.'},
                    status=status.HTTP_401_UNAUTHORIZED,
                )
            google_data = google_response.json()
            email = google_data.get('email')
            first_name = google_data.get('given_name', google_data.get('name', ''))
            last_name = google_data.get('family_name', '')
        except requests.RequestException:
            return Response(
                {'error': 'Could not validate Google token.'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

    if not email:
        return Response(
            {'error': 'Google account has no email.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user, created = User.objects.get_or_create(
        email=email,
        defaults={
            'username': email.split('@')[0],
            'first_name': first_name,
            'last_name': last_name,
            'is_active': True,
        },
    )

    if not created:
        # Update name if empty (for users created before this fix)
        updated = False
        if not user.first_name:
            user.first_name = google_data.get('given_name', google_data.get('name', ''))
            updated = True
        if not user.last_name:
            user.last_name = google_data.get('family_name', '')
            updated = True
        if updated:
            user.save()

    if created:
        UserProfile.objects.get_or_create(user=user)

    tokens = get_tokens_for_user(user)
    return Response({
        **tokens,
        'user': UserSerializer(user).data,
        'created': created,
    }, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


@api_view(['POST'])
def logout_view(request):
    """
    POST /api/users/logout/
    Blacklist the refresh token to logout.
    """
    refresh_token = request.data.get('refresh')
    if not refresh_token:
        return Response(
            {'error': 'refresh token is required.'},
            status=status.HTTP_400_BAD_REQUEST,
        )
    try:
        token = RefreshToken(refresh_token)
        token.blacklist()
    except TokenError:
        return Response(
            {'error': 'Invalid or expired token.'},
            status=status.HTTP_400_BAD_REQUEST,
        )
    return Response({'message': 'Logged out successfully.'}, status=status.HTTP_200_OK)


# ============================================
# USER PROFILE ENDPOINTS
# ============================================

@api_view(['GET'])
def me_view(request):
    """GET /api/users/me/ — Return current authenticated user data."""
    return Response(UserSerializer(request.user).data)


@api_view(['PUT', 'PATCH'])
def update_profile_view(request):
    """PUT/PATCH /api/users/me/profile/ — Update avatar, bio."""
    profile, _ = UserProfile.objects.get_or_create(user=request.user)
    serializer = UserProfileSerializer(
        profile,
        data=request.data,
        partial=request.method == 'PATCH',
    )
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(UserSerializer(request.user).data)


@api_view(['POST'])
def change_password_view(request):
    """POST /api/users/me/change-password/ — Change current user's password."""
    serializer = ChangePasswordSerializer(
        data=request.data,
        context={'request': request},
    )
    serializer.is_valid(raise_exception=True)
    request.user.set_password(serializer.validated_data['new_password'])
    request.user.save()
    return Response({'message': 'Password changed successfully.'})
