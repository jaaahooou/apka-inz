from django.apps import AppConfig

class CourtConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'court'

    def ready(self):
        # Importujemy sygnały przy starcie aplikacji
        import court.signals