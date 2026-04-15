from django.shortcuts import render

from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum
from transactions.models import Transaction
from .models import Budget
from .serializers import BudgetSerializer
from datetime import date

class BudgetViewSet(viewsets.ModelViewSet):
    serializer_class = BudgetSerializer

    def get_queryset(self):
        return Budget.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class SummaryView(APIView):
    def get(self, request):
        month_start = date.today().replace(day=1)
        qs = Transaction.objects.filter(user=request.user, date__gte=month_start)
        income = qs.filter(type='income').aggregate(t=Sum('amount'))['t'] or 0
        expense = qs.filter(type='expense').aggregate(t=Sum('amount'))['t'] or 0
        return Response({'income': income, 'expense': expense, 'balance': income - expense})


class ByCategoryView(APIView):
    def get(self, request):
        month_start = date.today().replace(day=1)
        data = (
            Transaction.objects
            .filter(user=request.user, type='expense', date__gte=month_start)
            .values('category__name')
            .annotate(total=Sum('amount'))
            .order_by('-total')
        )
        return Response(list(data))