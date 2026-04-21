from django.core.management.base import BaseCommand
from transactions.models import Category


DEFAULT_CATEGORIES = [
    {'name': 'Salary',        'type': 'income',  'icon': 'salary',        'color': '#22c55e'},
    {'name': 'Freelance',     'type': 'income',  'icon': 'freelance',     'color': '#06b6d4'},
    {'name': 'Investments',   'type': 'income',  'icon': 'investments',   'color': '#8b5cf6'},
    {'name': 'Gifts',         'type': 'income',  'icon': 'gifts',         'color': '#f59e0b'},
    {'name': 'Products',      'type': 'expense', 'icon': 'products',      'color': '#ef4444'},
    {'name': 'Transport',     'type': 'expense', 'icon': 'transport',     'color': '#f97316'},
    {'name': 'Entertainment', 'type': 'expense', 'icon': 'entertainment', 'color': '#ec4899'},
    {'name': 'Utility bills', 'type': 'expense', 'icon': 'utilities',     'color': '#64748b'},
    {'name': 'Health',        'type': 'expense', 'icon': 'health',        'color': '#14b8a6'},
    {'name': 'Clothes',       'type': 'expense', 'icon': 'clothes',       'color': '#a855f7'},
    {'name': 'Education',     'type': 'expense', 'icon': 'education',     'color': '#3b82f6'},
    {'name': 'Restaurants',   'type': 'expense', 'icon': 'restaurants',   'color': '#e11d48'},
]


class Command(BaseCommand):
    help = 'Seed default categories for all users or a specific user'

    def add_arguments(self, parser):
        parser.add_argument('--user', type=int, help='User ID to seed categories for')

    def handle(self, *args, **options):
        user_id = options.get('user')

        if user_id:
            from django.contrib.auth.models import User
            try:
                user = User.objects.get(pk=user_id)
            except User.DoesNotExist:
                self.stdout.write(self.style.ERROR(f'User {user_id} not found'))
                return

            created = 0
            for cat_data in DEFAULT_CATEGORIES:
                _, was_created = Category.objects.get_or_create(
                    user=user,
                    name=cat_data['name'],
                    defaults=cat_data,
                )
                if was_created:
                    created += 1
            self.stdout.write(self.style.SUCCESS(f'Created {created} categories for user "{user.username}"'))

        else:
       
            created = 0
            for cat_data in DEFAULT_CATEGORIES:
                _, was_created = Category.objects.get_or_create(
                    user=None,
                    is_default=True,
                    name=cat_data['name'],
                    defaults={**cat_data, 'is_default': True},
                )
                if was_created:
                    created += 1
            self.stdout.write(self.style.SUCCESS(f'Created {created} default categories'))