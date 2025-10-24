from django.urls import path
from .views.role_views import role_list_create, role_detail_crud

urlpatterns = [
    path('roles/', role_list_create, name='role-list-create'),
    path('roles/<int:pk>/', role_detail_crud, name='role-detail-crud'),
]