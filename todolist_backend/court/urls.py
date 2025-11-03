from django.urls import path
from .views.role_views import role_list_create, role_detail_crud
from .views import user_views, case_views, document_views, hearing_views, notification_views, CaseParticipant_views, auditLog_views

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
    
      # Hearing endpoints
    path('hearings/', hearing_views.hearing_list_create, name='hearing-list-create'),
    path('hearings/<int:pk>/', hearing_views.hearing_detail, name='hearing-detail'),
    path('hearings/<int:pk>/update/', hearing_views.hearing_update, name='hearing-update'),
    path('hearings/<int:pk>/delete/', hearing_views.hearing_delete, name='hearing-delete'),
    
      #Notificaton endpoints
    path('notifications/', notification_views.notification_list, name='notification-list'),
    path('notifications/unread-count/', notification_views.notification_unread_count, name='notification-unread-count'),
    path('notifications/<int:pk>/read/', notification_views.mark_notification_as_read, name='mark-notification-read'),
    path('notifications/read-all/', notification_views.mark_all_notifications_as_read, name='mark-all-notifications-read'),

    
    #caseParticipants endpoints
    path('cases/<int:case_id>/participants/', CaseParticipant_views.case_participants_list, name='case-participants-list'),
    path('cases/<int:case_id>/participants/<int:participant_id>/', CaseParticipant_views.case_participant_detail, name='case-participant-detail'),
    path('cases/<int:case_id>/participants/role/<str:role>/', CaseParticipant_views.case_participants_by_role, name='case-participants-by-role'),
    path('cases/<int:case_id>/participants/<int:participant_id>/remove/', CaseParticipant_views.remove_participant_from_case, name='remove-participant'),
    
    #AuditLog endpoints
    path('audit-logs/', auditLog_views.audit_log_list, name='audit-log-list'),
    path('audit-logs/object/<str:object_type>/<int:object_id>/', auditLog_views.audit_log_by_object, name='audit-log-by-object'),
    path('audit-logs/user/<int:user_id>/', auditLog_views.audit_log_by_user, name='audit-log-by-user'),
    path('audit-logs/statistics/', auditLog_views.audit_log_statistics, name='audit-log-statistics'),
    path('audit-logs/create/', auditLog_views.create_audit_log, name='create-audit-log'),
    
]

