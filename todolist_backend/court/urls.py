from django.urls import path
from .views.role_views import role_list_create, role_detail_crud
from .views import user_views

urlpatterns = [
    path('roles/', role_list_create, name='role-list-create'),
    path('roles/<int:pk>/', role_detail_crud, name='role-detail-crud'),
    path('users/', user_views.user_list_create, name='user-list-create'),
    path('users/<int:pk>/', user_views.user_detail, name='user-detail'),
    path('users/<int:pk>/update/', user_views.user_update, name='user-update'),
    path('users/<int:pk>/delete/', user_views.user_delete, name='user-delete'),
]

