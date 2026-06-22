# Generated manually

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='pending_role',
            field=models.CharField(
                blank=True,
                choices=[
                    ('VISITOR', 'Visiteur'),
                    ('TENANT', 'Locataire'),
                    ('LANDLORD', 'Propriétaire'),
                    ('ADMIN', 'Administrateur'),
                ],
                default='',
                max_length=20,
                verbose_name='Rôle en attente (post-vérification email)',
            ),
        ),
        migrations.AlterField(
            model_name='user',
            name='role',
            field=models.CharField(
                choices=[
                    ('VISITOR', 'Visiteur'),
                    ('TENANT', 'Locataire'),
                    ('LANDLORD', 'Propriétaire'),
                    ('ADMIN', 'Administrateur'),
                ],
                default='VISITOR',
                max_length=20,
                verbose_name='Rôle',
            ),
        ),
        migrations.CreateModel(
            name='AuthToken',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('token', models.CharField(db_index=True, max_length=64, unique=True)),
                ('token_type', models.CharField(
                    choices=[
                        ('EMAIL_VERIFY', 'Vérification email'),
                        ('PASSWORD_RESET', 'Réinitialisation mot de passe'),
                    ],
                    max_length=20,
                )),
                ('expires_at', models.DateTimeField()),
                ('used_at', models.DateTimeField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('user', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='auth_tokens',
                    to='users.user',
                )),
            ],
            options={
                'verbose_name': "Jeton d'authentification",
                'verbose_name_plural': "Jetons d'authentification",
            },
        ),
        migrations.CreateModel(
            name='UserAuditLog',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('action', models.CharField(
                    choices=[
                        ('SUSPEND', 'Suspension'),
                        ('ACTIVATE', 'Activation'),
                        ('SOFT_DELETE', 'Suppression logique'),
                        ('UPDATE', 'Modification'),
                    ],
                    max_length=20,
                )),
                ('details', models.JSONField(blank=True, default=dict)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('actor', models.ForeignKey(
                    null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name='audit_actions_performed',
                    to='users.user',
                    verbose_name='Administrateur',
                )),
                ('target', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='audit_logs',
                    to='users.user',
                    verbose_name='Utilisateur cible',
                )),
            ],
            options={
                'verbose_name': "Journal d'audit utilisateur",
                'verbose_name_plural': "Journaux d'audit utilisateur",
                'ordering': ['-created_at'],
            },
        ),
        migrations.AddIndex(
            model_name='authtoken',
            index=models.Index(fields=['token', 'token_type'], name='users_autht_token_8a0f0d_idx'),
        ),
    ]
