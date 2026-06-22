from django.db import migrations


def verify_existing_users(apps, schema_editor):
    User = apps.get_model('users', 'User')
    User.objects.filter(email_verified=False).exclude(role='VISITOR').update(email_verified=True)


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0002_auth_tokens_audit_pending_role'),
    ]

    operations = [
        migrations.RunPython(verify_existing_users, migrations.RunPython.noop),
    ]
