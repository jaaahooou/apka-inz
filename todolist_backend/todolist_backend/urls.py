from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from django.conf import settings
from django.conf.urls.static import static

# Importujemy nasz widok logowania
from court.views.user_views import CustomTokenObtainPairView

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # --- PRZYWRÓCONO: Aplikacja court pod prefiksem 'court/' ---
    path('court/', include('court.urls')), 
    
    # Tokeny JWT (Logowanie) zostają pod 'api/token/', bo AuthContext tam strzela
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)