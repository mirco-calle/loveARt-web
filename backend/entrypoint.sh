#!/bin/sh
set -e

echo "🚀 Starting Django application..."

# Run migrations
echo "📦 Running migrations..."
python manage.py migrate --noinput

# Create superuser if does not exist
echo "👤 Checking superuser..."
python manage.py shell << EOF
from django.contrib.auth import get_user_model
import os
User = get_user_model()
email = os.getenv("SUPERUSER_EMAIL", "mirco@gmail.com")
username = os.getenv("SUPERUSER_USERNAME", "mirco")
password = os.getenv("SUPERUSER_PASSWORD", "12345678")
if not User.objects.filter(email=email).exists():
    User.objects.create_superuser(email=email, username=username, password=password)
    print(f"✅ Superuser created: {email}")
else:
    print(f"ℹ️  Superuser already exists: {email}")
EOF

# Collect static files
echo "📁 Collecting static files..."
python manage.py collectstatic --noinput

# Start Gunicorn
echo "✅ Starting Gunicorn on port ${PORT:-8000}..."
exec gunicorn --bind 0.0.0.0:${PORT:-8000} \
    --workers 4 \
    --timeout 60 \
    --access-logfile - \
    --error-logfile - \
    --log-level info \
    loveart.wsgi:application
