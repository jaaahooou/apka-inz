from django.urls import path
from .views.role_views import role_list_create, role_detail_crud
from .views import user_views, case_views, document_views

urlpatterns = [
 # Role endpoints
    path('roles/', role_list_create, name='role-list-create'),
    path('roles/<int:pk>/', role_detail_crud, name='role-detail-crud'),
    
    # User endpoints
    path('users/', user_views.user_list_create, name='user-list-create'),
    path('users/<int:pk>/', user_views.user_detail, name='user-detail'),
    path('users/<int:pk>/update/', user_views.user_update, name='user-update'),
    path('users/<int:pk>/delete/', user_views.user_delete, name='user-delete'),
    
    # Case endpoints
    path('cases/', case_views.case_list_create, name='case-list-create'),
    path('cases/<int:pk>/', case_views.case_detail, name='case-detail'),
    path('cases/<int:pk>/update/', case_views.case_update, name='case-update'),
    path('cases/<int:pk>/delete/', case_views.case_delete, name='case-delete'),
    
     # Document endpoints
    path('documents/', document_views.document_list_create, name='document-list-create'),
    path('documents/<int:pk>/', document_views.document_detail, name='document-detail'),
    path('documents/<int:pk>/download/', document_views.document_download, name='document-download'),
    path('documents/<int:pk>/delete/', document_views.document_delete, name='document-delete'),
    path('cases/<int:case_id>/documents/', document_views.case_documents, name='case-documents'),
]

