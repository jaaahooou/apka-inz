from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from django.conf import settings
from django.core.exceptions import ValidationError


class Role(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name

class User(AbstractUser):
    role = models.ForeignKey(Role, on_delete=models.SET_NULL, null=True)
    phone = models.CharField(max_length=50)
    status = models.CharField(max_length=100)
    
    def __str__(self):
        return f'{self.first_name} {self.last_name}'

class Case(models.Model):
    case_number = models.CharField(max_length=100, unique=True)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=100)
    creator = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    assigned_judge = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_cases')
    created_at = models.DateTimeField(auto_now_add=True)

    filing_date = models.DateField(null=True, blank=True)
    category = models.CharField(max_length=100, default='Cywilna')
    value_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    def __str__(self):
        return self.title

class CaseParty(models.Model):
    case = models.ForeignKey(Case, related_name='parties', on_delete=models.CASCADE)
    name = models.CharField(max_length=200) 
    role = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True) 
    
    def __str__(self):
        return f"{self.role}: {self.name}"

class Hearing(models.Model):
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
    file_size = models.IntegerField(blank=True, null=True)
    
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
    title = models.CharField(max_length=200, default='Powiadomienie')
    message = models.TextField()
    notification_type = models.CharField(max_length=50, choices=NOTIFICATION_TYPE_CHOICES, default='message')
    is_read = models.BooleanField(default=False)
    case = models.ForeignKey(Case, on_delete=models.SET_NULL, null=True, blank=True, related_name='notifications')
    hearing = models.ForeignKey(Hearing, on_delete=models.SET_NULL, null=True, blank=True, related_name='notifications')
    document = models.ForeignKey(Document, on_delete=models.SET_NULL, null=True, blank=True, related_name='notifications')
    sender = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='sent_notifications')
    sent_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(null=True, blank=True) 
    class Meta:
        ordering = ['-sent_at']
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
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    joined_at = models.DateTimeField(auto_now_add=True)
    left_at = models.DateTimeField(null=True, blank=True)
    contact_email = models.EmailField(blank=True, null=True)
    contact_phone = models.CharField(max_length=50, blank=True, null=True)
    
    class Meta:
        unique_together = ('case', 'user')
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
    object_name = models.CharField(max_length=200, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    old_value = models.TextField(blank=True, null=True)
    new_value = models.TextField(blank=True, null=True)
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    user_agent = models.TextField(blank=True, null=True)
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
    """
    Pokój czatu.
    - Może reprezentować grupę lub rozmowę 1:1 (DM).
    - Dla DM wymuszamy unikalność pary użytkowników niezależnie od kolejności.
    """
    name = models.CharField(max_length=255, blank=True, default='')
    is_direct = models.BooleanField(default=False)

    user_a = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True, blank=True,
        on_delete=models.CASCADE,
        related_name='dm_as_a'
    )
    user_b = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True, blank=True,
        on_delete=models.CASCADE,
        related_name='dm_as_b'
    )

    participants = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        blank=True,
        related_name='chat_rooms'
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['is_direct', 'user_a', 'user_b']),
        ]

    def clean(self):
        """
        Wymuś porządek kanoniczny (user_a.id < user_b.id) oraz spójność pól dla DM vs. grup.
        """
        if self.is_direct:
            if not self.user_a or not self.user_b:
                raise ValidationError('DM wymaga pól user_a i user_b.')
            if self.user_a_id == self.user_b_id:
                raise ValidationError('Nie można utworzyć DM z samym sobą.')
            if self.user_a_id and self.user_b_id and self.user_a_id > self.user_b_id:
                self.user_a, self.user_b = self.user_b, self.user_a
        else:
            if self.user_a or self.user_b:
                raise ValidationError('Pola user_a/user_b są dozwolone tylko dla is_direct=True.')

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    def __str__(self):
        if self.is_direct and self.user_a and self.user_b:
            return f"DM:{self.user_a_id}-{self.user_b_id}"
        return self.name or f"Room {self.pk}"


class Message(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    recipient = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='received_messages', 
        null=True,
        blank=True
    )
    room = models.ForeignKey(
        ChatRoom, 
        on_delete=models.CASCADE, 
        related_name='messages', 
        null=True, 
        blank=True
    )
    content = models.TextField(blank=True, default="") # Zmieniono na blank=True, aby można było wysłać sam plik
    attachment = models.FileField(upload_to='chat_attachments/%Y/%m/%d/', null=True, blank=True) # Nowe pole dla załączników
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        if self.room:
            return f"{self.sender} -> {self.room}: {self.content[:50]}"
        return f"{self.sender} -> {self.recipient}: {self.content[:50]}"


class FavoriteContact(models.Model):
    """
    Biała lista kontaktów widocznych w lewym panelu dla danego użytkownika.
    """
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='favorite_contacts'
    )
    contact = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='favorited_by'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = [('owner', 'contact')]
        indexes = [
            models.Index(fields=['owner', 'contact']),
        ]

    def __str__(self):
        return f"{self.owner_id}->{self.contact_id}"



