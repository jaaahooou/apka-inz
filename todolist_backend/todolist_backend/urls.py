from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from django.conf import settings
from django.conf.urls.static import static

# --- ZMIANA: Importujemy nasz własny widok logowania ---
from court.views.user_views import CustomTokenObtainPairView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('court/', include('court.urls')), 
    
    # --- ZMIANA: Używamy CustomTokenObtainPairView zamiast domyślnego ---
    # Dzięki temu backend rozróżni złe hasło od nieaktywnego konta
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

# tylko dla developmentu
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)