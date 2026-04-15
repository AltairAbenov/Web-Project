from django.core.management.base import BaseCommand
from transactions.models import Category

class Command(BaseCommand):
    def handle(self, *args, **kwargs):
        cats = [
            ('Еда', '🍔'), ('Транспорт', '🚗'), ('Зарплата', '💰'),
            ('Развлечения', '🎬'), ('Здоровье', '💊'),
            ('Шоппинг', '🛍'), ('Коммуналка', '💡'), ('Другое', '📦'),
        ]
        for name, icon in cats:
            Category.objects.get_or_create(
                name=name, defaults={'icon': icon, 'is_default': True}
            )
        self.stdout.write(self.style.SUCCESS('Категории созданы!'))
        