from django.db import models
from django.contrib.auth.models import AbstractUser

class Role(models.Model):
    name = models.CharField(max_length=100)

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
    case = models.ForeignKey(Case, on_delete=models.CASCADE)
    date = models.DateTimeField()
    location = models.CharField(max_length=200)
    status = models.CharField(max_length=100)
    notes = models.TextField(blank=True)

class Document(models.Model):
    case = models.ForeignKey(Case, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    file_name = models.CharField(max_length=200)
    file_path = models.CharField(max_length=255)
    uploaded_at = models.DateTimeField(auto_now_add=True)

class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    case = models.ForeignKey(Case, on_delete=models.SET_NULL, null=True)
    sent_at = models.DateTimeField(auto_now_add=True)

class CaseParticipant(models.Model):
    case = models.ForeignKey(Case, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    role_in_case = models.CharField(max_length=100)

class AuditLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    action = models.CharField(max_length=200)
    object_type = models.CharField(max_length=100)
    object_id = models.IntegerField(null=True)
    ip_address = models.CharField(max_length=100)
    timestamp = models.DateTimeField(auto_now_add=True)
