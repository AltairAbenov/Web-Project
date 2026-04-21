from django.shortcuts import render

from rest_framework import viewsets
from django.db import models as m
from .models import Transaction, Category
from .serializers import TransactionSerializer, CategorySerializer

class TransactionViewSet(viewsets.ModelViewSet):
    serializer_class = TransactionSerializer
    filterset_fields = ['type']

    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user).select_related('category')

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        instance = serializer.save()
       
        instance = Transaction.objects.select_related('category').get(pk=instance.pk)
        from rest_framework.response import Response
        from rest_framework import status
        return Response(self.get_serializer(instance).data, status=status.HTTP_201_CREATED)

class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer

    def get_queryset(self):
        return Category.objects.filter(
            m.Q(user=self.request.user)
        )

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)