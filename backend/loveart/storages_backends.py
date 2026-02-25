from storages.backends.s3boto3 import S3Boto3Storage

class MediaStorage(S3Boto3Storage):
    """
    Custom storage for media files to be served via CloudFront.
    Uploads will go to the 'uploads/' directory in the S3 bucket.
    """
    location = 'uploads'
    file_overwrite = False
    # If AWS_S3_CUSTOM_DOMAIN is set in settings, it will be used for URLs.

class StaticStorage(S3Boto3Storage):
    """
    Custom storage for static files.
    Uploads will go to the 'static/' directory in the S3 bucket.
    """
    location = 'static'
    default_acl = 'public-read'
