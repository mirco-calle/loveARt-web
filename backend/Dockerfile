# Base stage - Dependencies and common settings
FROM python:3.11-slim AS base
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    poppler-utils \
    libmagic1 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

# Development stage
FROM base AS development
RUN python -m pip install --upgrade pip \
    && python -m pip install -r requirements.txt --no-cache-dir
COPY . .
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]

# Production stage
FROM base AS production
RUN python -m pip install --upgrade pip \
    && python -m pip install -r requirements.txt gunicorn --no-cache-dir
# Copy source after deps to leverage Docker layer caching
COPY . .
# Make start script executable
RUN echo '#!/bin/sh\n\
set -e\n\
\n\
echo "🚀 Starting Django application..."\n\
\n\
# Run migrations\n\
echo "📦 Running migrations..."\n\
python manage.py migrate --noinput\n\
\n\

\n\
# Create superuser if does not exist\n\
echo "👤 Checking superuser..."\n\
python manage.py shell << EOF\n\
from django.contrib.auth import get_user_model\n\
import os\n\
User = get_user_model()\n\
email = os.getenv("SUPERUSER_EMAIL", "mirco@gmail.com")\n\
username = os.getenv("SUPERUSER_USERNAME", "mirco")\n\
password = os.getenv("SUPERUSER_PASSWORD", "12345678")\n\
if not User.objects.filter(email=email).exists():\n\
    User.objects.create_superuser(email=email, username=username, password=password)\n\
    print(f"✅ Superuser created: {email}")\n\
else:\n\
    print(f"ℹ️  Superuser already exists: {email}")\n\
EOF\n\
\n\
# Collect static files\n\
echo "📁 Collecting static files..."\n\
python manage.py collectstatic --noinput\n\
\n\
# Start Gunicorn\n\
echo "✅ Starting Gunicorn on port ${PORT:-8000}..."\n\
exec gunicorn --bind 0.0.0.0:${PORT:-8000} \\\n\
    --workers 4 \\\n\
    --timeout 60 \\\n\
    --access-logfile - \\\n\
    --error-logfile - \\\n\
    --log-level info \\\n\
    loveart.wsgi:application\n\
' > /app/entrypoint.sh && chmod +x /app/entrypoint.sh

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/admin/').read()" || exit 1

CMD ["/app/entrypoint.sh"]

