from django.contrib import admin
from .models import User, Role, Case, CaseParty, Hearing, Document, Notification, CaseParticipant, AuditLog, Message, ChatRoom

# 1. Konfiguracja Użytkownika
@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'is_active', 'role', 'status')
    list_filter = ('is_active', 'role')
    search_fields = ('username', 'email', 'last_name')
    list_editable = ('is_active',)

# 2. Konfiguracja Ról
@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')

# --- 3. SPRAWY I STRONY POSTĘPOWANIA (NOWOŚĆ) ---

class CasePartyInline(admin.TabularInline):
    model = CaseParty
    extra = 1

@admin.register(Case)
class CaseAdmin(admin.ModelAdmin):
    list_display = ('case_number', 'title', 'status', 'assigned_judge', 'created_at')
    list_filter = ('status', 'assigned_judge')
    search_fields = ('case_number', 'title')
    inlines = [CasePartyInline]

@admin.register(CaseParty)
class CasePartyAdmin(admin.ModelAdmin):
    list_display = ('name', 'role', 'case')
    search_fields = ('name', 'role')

# --- 4. POZOSTAŁE MODELE ---

@admin.register(Hearing)
class HearingAdmin(admin.ModelAdmin):
    list_display = ('case', 'date_time', 'location', 'judge', 'status')
    list_filter = ('status', 'judge')

@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ('title', 'case', 'uploaded_by', 'uploaded_at')

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'is_read', 'sent_at')

@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ('action', 'user', 'object_type', 'timestamp')
    list_filter = ('action', 'object_type')