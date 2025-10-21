from django.urls import path
from .views import TaskListView, TaskDetailView
from django.http import HttpResponse

def home(request):
    return HttpResponse("Backend Django działa!")

urlpatterns = [
    path('tasks/', TaskListView.as_view(), name='task-list'),
    path('tasks/<int:pk>/', TaskDetailView.as_view(), name='task-detail'),
]
