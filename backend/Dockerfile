# Base stage - Dependencies and common settings
FROM python:3.11-slim AS base
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libmagic1 \
    curl \
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
RUN chmod +x /app/entrypoint.sh

# Expose port
EXPOSE 8000

# Health check: más permisivo - 90s start-period y usa /api/ en vez de /admin/
# /api/ retorna JSON inmediatamente sin requerir static files
HEALTHCHECK --interval=30s --timeout=10s --start-period=90s --retries=5 \
    CMD curl -f http://localhost:8000/ || exit 1

ENTRYPOINT ["/app/entrypoint.sh"]
