from django.db import migrations, models


class Migration(migrations.Migration):
    """Add original_format field to Model3D to track the pre-conversion file type."""

    dependencies = [
        ('architecture_ar', '0003_blueprint_file_size_blueprint_height_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='model3d',
            name='original_format',
            field=models.CharField(
                blank=True,
                help_text='Original upload format (FBX, OBJ, etc.) before conversion.',
                max_length=10,
                null=True,
            ),
        ),
    ]
