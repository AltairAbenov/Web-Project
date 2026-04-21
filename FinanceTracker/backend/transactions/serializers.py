from rest_framework import serializers
from .models import Transaction, Category

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'icon']

class TransactionSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Transaction
        fields = ['id', 'amount', 'type', 'category', 'category_name',
                  'description', 'date', 'created_at']

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("The amount should be more 0")
        return value

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)