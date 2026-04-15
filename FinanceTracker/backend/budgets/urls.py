from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import BudgetViewSet, SummaryView, ByCategoryView

router = DefaultRouter()
router.register('budgets', BudgetViewSet, basename='budget')

urlpatterns = router.urls + [
    path('analytics/summary/', SummaryView.as_view()),
    path('analytics/by-category/', ByCategoryView.as_view()),
]