from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from users.api.views import (
    register_view,
    login_view,
    google_login_view,
    logout_view,
    me_view,
    update_profile_view,
    change_password_view,
    verify_email_view,
    resend_verification_view,
)

urlpatterns = [
    # Auth
    path('register/', register_view, name='user-register'),
    path('login/', login_view, name='user-login'),
    path('google/', google_login_view, name='user-google-login'),
    path('logout/', logout_view, name='user-logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    # Email verification
    path('verify-email/', verify_email_view, name='user-verify-email'),
    path('resend-verification/', resend_verification_view, name='user-resend-verification'),
    # Profile
    path('me/', me_view, name='user-me'),
    path('me/profile/', update_profile_view, name='user-update-profile'),
    path('me/change-password/', change_password_view, name='user-change-password'),
]
