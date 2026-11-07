"""
Seed Reach Out referral resources and clearly-labelled demonstration responders.

Referral numbers must be re-confirmed before any public launch; `verified_on`
is left empty on purpose so the interface does not claim verification.
"""
from django.core.management.base import BaseCommand
from django.db import transaction

from apps.support.models import ReferralResource

RESOURCES = [
    dict(order=1, short_name='911', name='National Emergency Hotline', kind='emergency', is_24_7=True,
         description='Police, fire and medical emergencies anywhere in the Philippines.',
         description_fil='Para sa pulis, sunog at medikal na emerhensiya saanman sa Pilipinas.',
         phones=[{'label': 'Emergency', 'number': '911'}], hours='24/7'),
    dict(order=2, short_name='NCMH', name='National Center for Mental Health Crisis Hotline', kind='crisis_line', is_24_7=True,
         description='24/7, free and confidential crisis support by phone.',
         description_fil='Libreng suporta sa krisis at psychological first aid sa telepono, saanman sa bansa.',
         phones=[{'label': 'Nationwide', 'number': '1553'}, {'label': 'Toll-free', 'number': '1800-1888-1553'},
                 {'label': 'Globe/TM', 'number': '0917-899-8727'},
                 {'label': 'Smart/TNT', 'number': '0908-639-2672'}],
         hours='24/7', source_url='https://ncmh.gov.ph/'),
    dict(order=3, short_name='Hopeline', name='Hopeline Philippines', kind='crisis_line', is_24_7=True,
         description='Emotional support and suicide prevention line.',
         description_fil='Linya para sa emosyonal na suporta at pag-iwas sa pagpapakamatay.',
         phones=[{'label': 'Landline', 'number': '(02) 8804-4673'}, {'label': 'Globe/TM', 'number': '0917-558-4673'}],
         hours='24/7'),
    dict(order=4, short_name='DOH CHD I', name='Department of Health – Center for Health Development I', kind='crisis_line',
         is_24_7=False,
         description='Mental health hotline of the DOH regional office for Ilocos. Listed by the Provincial Government of La Union.',
         description_fil='Mental health hotline ng DOH regional office para sa Ilocos. Mula sa listahan ng Pamahalaang Panlalawigan ng La Union.',
         phones=[{'label': 'Smart', 'number': '0961-815-1416'}, {'label': 'Globe', 'number': '0945-491-4447'}],
         hours='Mon–Fri, 8:00–17:00'),
    dict(order=5, short_name='ITRMC', name='Ilocos Training and Regional Medical Center — Psychiatry', kind='hospital',
         location='Parian, City of San Fernando, La Union',
         description='Regional public hospital with psychiatric consultation and emergency care.',
         description_fil='Pampublikong ospital ng rehiyon na may konsultasyong saykayatriko at emergency care.',
         phones=[{'label': 'Hospital', 'number': '(072) 607-6418'}], hours='Emergency room open 24/7'),
    dict(order=6, short_name='CDRRMO', name='San Fernando City Disaster Risk Reduction and Management Office', kind='government',
         location='City Hall Compound, San Fernando, La Union',
         description='City emergency response and ambulance dispatch.',
         description_fil='Tugon sa emerhensiya at ambulansya ng lungsod.',
         phones=[{'label': 'Office', 'number': '(072) 687-8100'}], hours='24/7'),
]

class Command(BaseCommand):
    help = 'Seed referral resources for Get help'

    @transaction.atomic
    def handle(self, *args, **opts):
        for r in RESOURCES:
            ReferralResource.objects.update_or_create(name=r['name'], defaults=r)
        self.stdout.write(self.style.SUCCESS(f'Seeded {len(RESOURCES)} referral resources.'))
