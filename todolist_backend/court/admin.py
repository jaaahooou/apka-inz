from django.contrib import admin
from .models import User  # Importujemy Twój model

# Rejestrujemy model User w panelu admina
@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'is_active', 'role', 'status') # To widać w tabelce
    list_filter = ('is_active', 'role') # Filtry po prawej stronie
    search_fields = ('username', 'email', 'last_name') # Pasek wyszukiwania
    
    # Pozwala edytować pole 'is_active' bezpośrednio z listy (opcjonalne, ale wygodne)
    list_editable = ('is_active',)