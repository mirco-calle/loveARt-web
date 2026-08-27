from django.conf import settings
from storages.backends.s3boto3 import S3Boto3Storage

class SupabaseMediaStorage(S3Boto3Storage):
    """
    Custom storage for Supabase Storage (S3-compatible protocol).
    Stores uploaded images, videos, blueprints and 3D models.
    """
    file_overwrite = False
    default_acl = None
    querystring_auth = False

    def url(self, name):
        # Si está configurada la URL pública directa de Supabase
        custom_domain = getattr(settings, 'AWS_S3_CUSTOM_DOMAIN', None)
        if custom_domain:
            return f"https://{custom_domain}/{name.lstrip('/')}"
        
        supabase_url = getattr(settings, 'SUPABASE_URL', None)
        bucket_name = getattr(settings, 'AWS_STORAGE_BUCKET_NAME', None)
        if supabase_url and bucket_name:
            base = supabase_url.rstrip('/')
            clean_name = name.lstrip('/')
            return f"{base}/storage/v1/object/public/{bucket_name}/{clean_name}"
            
        return super().url(name)


class MediaStorage(S3Boto3Storage):
    """
    Legacy AWS S3 Media Storage
    """
    location = 'uploads'
    file_overwrite = False
    default_acl = None
    custom_domain = getattr(settings, 'AWS_S3_CUSTOM_DOMAIN', None)


class StaticStorage(S3Boto3Storage):
    """
    Legacy AWS S3 Static Storage
    """
    location = 'static'
    default_acl = None
    custom_domain = getattr(settings, 'AWS_S3_CUSTOM_DOMAIN', None)
