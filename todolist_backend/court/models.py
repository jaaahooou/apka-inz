from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone

class Role(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name

class User(AbstractUser):
    # AbstractUser już ma: username, password, email, first_name, last_name
    # Dodajesz tylko dodatkowe pola:
    role = models.ForeignKey(Role, on_delete=models.SET_NULL, null=True)
    phone = models.CharField(max_length=50)
    status = models.CharField(max_length=100)
    # created_at - możesz użyć date_joined z AbstractUser lub dodać własne
    
    def __str__(self):
        return f'{self.first_name} {self.last_name}'
class Case(models.Model):
    case_number = models.CharField(max_length=100, unique=True)
    title = models.CharField(max_length=200)
    description = models.TextField()
    status = models.CharField(max_length=100)
    creator = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class Hearing(models.Model):
    # Definiuj dostępne statusy
    STATUS_CHOICES = [
        ('zaplanowana', 'Zaplanowana'),
        ('odbyta', 'Odbyta'),
        ('odłożona', 'Odłożona'),
    ]
    
    case = models.ForeignKey(Case, on_delete=models.CASCADE, related_name='hearings')
    date_time = models.DateTimeField()
    location = models.CharField(max_length=200)
    status = models.CharField(max_length=100, choices=STATUS_CHOICES, default='zaplanowana')
    judge = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.case.case_number} - {self.get_status_display()}"


class Document(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    file = models.FileField(upload_to='documents/%Y/%m/%d/')
    case = models.ForeignKey(Case, on_delete=models.CASCADE, related_name='documents')
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    file_size = models.IntegerField(blank=True, null=True)  # w bajtach
    
    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        if self.file:
            self.file_size = self.file.size
        super().save(*args, **kwargs)

class Notification(models.Model):
    NOTIFICATION_TYPE_CHOICES = [
        ('hearing_reminder', 'Przypomnienie o rozprawie'),
        ('document_added', 'Dodano dokument'),
        ('status_changed', 'Zmieniono status sprawy'),
        ('case_updated', 'Zaktualizowano sprawę'),
        ('new_participant', 'Nowy uczestnik sprawy'),
        ('message', 'Wiadomość'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=200, default='Powiadomienie')  # Krótki tytuł
    message = models.TextField()
    notification_type = models.CharField(max_length=50, choices=NOTIFICATION_TYPE_CHOICES, default='message')
    is_read = models.BooleanField(default=False)
    case = models.ForeignKey(Case, on_delete=models.SET_NULL, null=True, blank=True, related_name='notifications')
    hearing = models.ForeignKey(Hearing, on_delete=models.SET_NULL, null=True, blank=True, related_name='notifications')  # Link do rozprawy
    document = models.ForeignKey(Document, on_delete=models.SET_NULL, null=True, blank=True, related_name='notifications')  # Link do dokumentu
    sender = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='sent_notifications')  # Kto wysłał
    sent_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(null=True, blank=True)  # Kiedy przeczytano
    
    class Meta:
        ordering = ['-sent_at']  # Najnowsze powiadomienia na górze
        indexes = [
            models.Index(fields=['user', '-sent_at']),
            models.Index(fields=['is_read']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.user.username}"
    
    def mark_as_read(self):
        """Oznacz powiadomienie jako przeczytane"""
        
        self.is_read = True
        self.read_at = timezone.now()
        self.save()

class CaseParticipant(models.Model):
    PARTICIPANT_TYPE_CHOICES = [
        ('plaintiff', 'Powód'),
        ('defendant', 'Pozwany'),
        ('prosecutor', 'Prokuratura'),
        ('accused', 'Oskarżony'),
        ('lawyer', 'Adwokat'),
        ('representative', 'Pełnomocnik'),
        ('witness', 'Świadek'),
        ('other', 'Inne'),
    ]
    
    case = models.ForeignKey(Case, on_delete=models.CASCADE, related_name='participants')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='case_participations')
    role_in_case = models.CharField(max_length=50, choices=PARTICIPANT_TYPE_CHOICES)
    description = models.TextField(blank=True, null=True)  # Szczegółowy opis roli
    is_active = models.BooleanField(default=True)  # Czy uczestnik jest aktywny
    joined_at = models.DateTimeField(auto_now_add=True)  # Kiedy dołączył
    left_at = models.DateTimeField(null=True, blank=True)  # Kiedy odszedł (jeśli dotyczy)
    contact_email = models.EmailField(blank=True, null=True)  # Dodatkowy email do kontaktu
    contact_phone = models.CharField(max_length=50, blank=True, null=True)  # Dodatkowy telefon
    
    class Meta:
        unique_together = ('case', 'user')  # Każdy użytkownik może mieć tylko jedną rolę w sprawie
        ordering = ['joined_at']
        indexes = [
            models.Index(fields=['case', 'role_in_case']),
            models.Index(fields=['user', 'is_active']),
        ]
    
    def __str__(self):
        return f"{self.user.username} - {self.get_role_in_case_display()} w sprawie {self.case.case_number}"

class AuditLog(models.Model):
    ACTION_CHOICES = [
        ('CREATE', 'Utworzenie'),
        ('UPDATE', 'Aktualizacja'),
        ('DELETE', 'Usunięcie'),
        ('VIEW', 'Przeglądanie'),
        ('DOWNLOAD', 'Pobranie'),
        ('LOGIN', 'Logowanie'),
        ('LOGOUT', 'Wylogowanie'),
    ]
    
    OBJECT_TYPE_CHOICES = [
        ('Case', 'Sprawa'),
        ('Hearing', 'Rozprawa'),
        ('Document', 'Dokument'),
        ('User', 'Użytkownik'),
        ('Role', 'Rola'),
        ('CaseParticipant', 'Uczestnik sprawy'),
        ('Notification', 'Powiadomienie'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='audit_logs')
    action = models.CharField(max_length=50, choices=ACTION_CHOICES)
    object_type = models.CharField(max_length=100, choices=OBJECT_TYPE_CHOICES)
    object_id = models.IntegerField(null=True, blank=True)
    object_name = models.CharField(max_length=200, blank=True, null=True)  # Nazwa obiektu dla łatwości
    description = models.TextField(blank=True, null=True)  # Szczegółowy opis
    old_value = models.TextField(blank=True, null=True)  # Stara wartość (dla UPDATE)
    new_value = models.TextField(blank=True, null=True)  # Nowa wartość (dla UPDATE)
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    user_agent = models.TextField(blank=True, null=True)  # Info o przeglądarce
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)
    
    class Meta:
        ordering = ['-timestamp']
        verbose_name = 'Dziennik audytu'
        verbose_name_plural = 'Dzienniki audytu'
        indexes = [
            models.Index(fields=['user', '-timestamp']),
            models.Index(fields=['object_type', 'object_id']),
            models.Index(fields=['action']),
            models.Index(fields=['-timestamp']),
        ]
    
    def __str__(self):
        return f"{self.get_action_display()} - {self.get_object_type_display()} #{self.object_id} - {self.user.username if self.user else 'Anonymous'}"
    
    
class ChatRoom(models.Model):
    """Model pokoju czatu"""
    name = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return self.name


class Message(models.Model):
    """Model wiadomości"""
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['room', 'created_at']),
        ]
    
    def __str__(self):
        return f"{self.sender.username}: {self.content[:50]}"

