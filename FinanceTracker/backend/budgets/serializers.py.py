from rest_framework import serializers
from django.db.models import Sum
from transactions.models import Transaction
from .models import Budget

class BudgetSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    spent = serializers.SerializerMethodField()

    class Meta:
        model = Budget
        fields = ['id', 'category', 'category_name', 'amount_limit', 'spent', 'month']

    def get_spent(self, obj):
        total = Transaction.objects.filter(
            user=obj.user,
            category=obj.category,
            type='expense',
            date__year=obj.month.year,
            date__month=obj.month.month
        ).aggregate(total=Sum('amount'))['total']
        return total or 0