from django.core.management.base import BaseCommand

from apps.insights.demo import REMOVED_MARKER, clear_demo, demo_counts, load_demo


class Command(BaseCommand):
    help = 'Add (or remove) clearly-marked sample accounts, journals and usage counts for demos.'

    def add_arguments(self, parser):
        parser.add_argument('--clear', action='store_true', help='Remove all sample data and stop.')
        parser.add_argument('--if-empty', action='store_true', help='Only add sample data if none exists yet and it was not removed on purpose.')
        parser.add_argument('--users', type=int, default=60)
        parser.add_argument('--days', type=int, default=90)
        parser.add_argument('--research-share', type=float, default=0.3, help='Share of sample accounts that opt in to research.')

    def handle(self, *args, **o):
        if o['clear']:
            self.stdout.write(self.style.SUCCESS(f'Removed sample data: {clear_demo()}'))
            return
        if o['if_empty'] and (demo_counts()['users'] or REMOVED_MARKER.exists()):
            self.stdout.write('Sample data already present (or removed on purpose); nothing to do.')
            return
        n = load_demo(users=o['users'], days=o['days'], research_share=o['research_share'])
        self.stdout.write(self.style.SUCCESS(f'Added sample data: {n}'))
