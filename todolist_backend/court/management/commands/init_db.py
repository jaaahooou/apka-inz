from django.core.management.base import BaseCommand
from court.models import Role, User
from django.utils import timezone

class Command(BaseCommand):
    help = 'Tworzy podstawowe role i użytkowników testowych'

    def handle(self, *args, **kwargs):
        self.stdout.write("🌱 Rozpoczynam zasiewanie bazy danych...")
        roles_data = [
            'ADMIN',
            'Sędzia',
            'SEDZIA',
            'Sekretariat',
            'Adwokat',
            'Woźny',
            'Prokurator',
            'Asystent sędziego'
        ]

        roles_objects = {}
        for role_name in roles_data:
            role, created = Role.objects.get_or_create(name=role_name)
            roles_objects[role_name] = role
            if created:
                self.stdout.write(f"   - Utworzono rolę: {role_name}")
            else:
                self.stdout.write(f"   - Rola już istnieje: {role_name}")

        if not User.objects.filter(username='admin').exists():
            admin = User.objects.create_superuser('admin', 'admin@sad.pl', 'haslo123')
            if 'ADMIN' in roles_objects:
                admin.role = roles_objects['ADMIN']
            admin.save()
            self.stdout.write("   - Utworzono Superusera: admin (hasło: haslo123)")
        
        users_to_create = [
            ('sedzia1', 'Sędzia'),
            ('sekretariat1', 'Sekretariat'),
            ('adwokat1', 'Adwokat'),
            ('wozny1', 'Woźny'),
        ]

        for username, role_name in users_to_create:
            if not User.objects.filter(username=username).exists():
                user = User.objects.create_user(username=username, email=f'{username}@sad.pl', password='haslo123')
                
                if role_name in roles_objects:
                    user.role = roles_objects[role_name]
                
                user.is_active = True 
                user.first_name = "Jan"
                user.last_name = f"Testowy ({role_name})"
                user.save()
                self.stdout.write(f"   - Utworzono użytkownika: {username} (Rola: {role_name}, hasło: haslo123)")

        self.stdout.write(self.style.SUCCESS('✅ Baza danych została pomyślnie zainicjowana!'))