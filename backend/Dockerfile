# Base stage - Dependencies and common settings
FROM python:3.11-slim AS base
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    poppler-utils \
    libmagic1 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Download FBX2glTF binary to /usr/local/bin (system PATH, outside the volume mount)
# This ensures it's available even when ./backend is mounted as a volume in docker-compose
RUN curl -fsSL \
    -o /usr/local/bin/FBX2glTF \
    https://github.com/facebookincubator/FBX2glTF/releases/download/v0.9.7/FBX2glTF-linux-x64 \
    && chmod +x /usr/local/bin/FBX2glTF

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
RUN chmod +x /app/entrypoint.sh

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=60s --timeout=15s --start-period=60s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/admin/').read()" || exit 1

ENTRYPOINT ["/app/entrypoint.sh"]
