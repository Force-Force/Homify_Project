# Generated manually for architecture refactor

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('properties', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='property',
            name='rejection_reason',
            field=models.TextField(blank=True, default='', verbose_name='Motif de rejet'),
        ),
    ]
