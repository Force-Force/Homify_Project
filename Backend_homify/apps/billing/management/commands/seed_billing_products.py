"""Seed default billing products."""
from django.core.management.base import BaseCommand

from apps.billing.models import BillingProduct

DEFAULT_PRODUCTS = [
    {
        'code': 'BOOST_7D',
        'name': 'Boost 7 jours',
        'description': 'Mise en tête des résultats pendant 7 jours.',
        'product_type': 'BOOST',
        'amount_fcfa': 5000,
        'duration_days': 7,
        'sort_order': 1,
    },
    {
        'code': 'BOOST_14D',
        'name': 'Boost 14 jours',
        'description': 'Visibilité maximale pendant 14 jours.',
        'product_type': 'BOOST',
        'amount_fcfa': 9000,
        'duration_days': 14,
        'sort_order': 2,
    },
    {
        'code': 'PLAN_PRO_MONTHLY',
        'name': 'Plan Pro — 1 mois',
        'description': 'Annonces illimitées, priorité modération, badge Pro.',
        'product_type': 'SUBSCRIPTION',
        'amount_fcfa': 15000,
        'duration_days': 30,
        'sort_order': 10,
    },
]


class Command(BaseCommand):
    help = 'Crée ou met à jour les produits de facturation Homify.'

    def handle(self, *args, **options):
        for data in DEFAULT_PRODUCTS:
            obj, created = BillingProduct.objects.update_or_create(
                code=data['code'],
                defaults={**data, 'is_active': True},
            )
            action = 'Créé' if created else 'Mis à jour'
            self.stdout.write(f'{action}: {obj.code} — {obj.amount_fcfa} FCFA')

        self.stdout.write(self.style.SUCCESS('Catalogue billing prêt.'))
