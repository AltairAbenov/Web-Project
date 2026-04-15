from django.db import models

from django.contrib.auth.models import User
from transactions.models import Category

class Budget(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    amount_limit = models.DecimalField(max_digits=10, decimal_places=2)
    month = models.DateField()

    class Meta:
        unique_together = ['user', 'category', 'month']