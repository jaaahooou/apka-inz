Aplikacja inżyierska: 
Baza danych: 
https://dbdiagram.io/d/apka-inzynierska-6857fe0af039ec6d365286bd?fbclid=IwY2xjawNjhJZleHRuA2FlbQIxMABicmlkETA2VXFrOUQyN1V2c2J1RFBJAR6zGudNdzrQGS92rSXPxa91gitm57JvVsPyECEKdole2PFRDp0CcyO6_alIxQ_aem_BlqQ5nzZWARPzttU79AfnA

# Backend API - Dokumentacja

Backend aplikacji oparty na Django REST Framework z autentykacją JWT.

## Spis treści

- [Instalacja i konfiguracja](#instalacja-i-konfiguracja)
- [Autentykacja JWT](#autentykacja-jwt)
- [Endpointy API](#endpointy-api)
- [Testowanie w Postman](#testowanie-w-postman)
- [Konfiguracja deweloperska](#konfiguracja-deweloperska)
- [Troubleshooting](#troubleshooting)

## Instalacja i konfiguracja

### Wymagania
- Python 3.14+
- Django 5.1.5
- Django REST Framework
- djangorestframework-simplejwt

### Instalacja
pip install django djangorestframework djangorestframework-simplejwt django-cors-headers

text

### Uruchomienie
python manage.py runserver

text

Serwer: `http://localhost:8000`

## Autentykacja JWT

### Logowanie - uzyskanie tokenu

**POST** `/api/token/`

Headers: 
Content-type: aplication/json - zawsze i wszędzie!!!!!!!!!!!

Body:
{
"username": "admin",
"password": "haslo123"
}



Odpowiedź:
{
"access": "token_tutaj...",
"refresh": "refresh_token_tutaj..."
}



- access token: ważny 90 dni
- refresh token: ważny 180 dni

### Odświeżanie tokenu

**POST** `/api/token/refresh/`

Body:
{
"refresh": "twoj_refresh_token"
}

text

### Użycie tokenu

W każdym requeście dodaj header:
Authorization: Bearer twoj_access_token

text

## Endpointy API

### Użytkownicy

#### 1. Lista użytkowników
**GET** `/court/users/`

Wymaga: Bearer Token

#### 2. Szczegóły użytkownika
**GET** `/court/users/{id}/`

Wymaga: Bearer Token

#### 3. Tworzenie użytkownika
**POST** `/court/users/`

Wymaga: Bearer Token

Body:
{
"username": "jan_kowalski",
"password": "haslo123",
"email": "jan@example.com",
"first_name": "Jan",
"last_name": "Kowalski",
"role": 1,
"phone": "+48123456789",
"status": "active"
}

text

Pola wymagane:
- username (unikalna)
- password (będzie zahashowane)

#### 4. Aktualizacja użytkownika (częściowa)
**PATCH** `/court/users/{id}/update/`

Wymaga: Bearer Token

Edytowalne pola: email, phone, role

Body (przykład):
{
"email": "nowy@example.com",
"phone": "+48987654321"
}

text

#### 5. Aktualizacja użytkownika (pełna)
**PUT** `/court/users/{id}/update/`

Wymaga: Bearer Token

#### 6. Usunięcie użytkownika
**DELETE** `/court/users/{id}/delete/`

Wymaga: Bearer Token

## Testowanie w Postman

### Krok 1: Uzyskaj token
1. POST do `/api/token/`
2. Body: raw → JSON
3. Dodaj username i password
4. Skopiuj access token

### Krok 2: Użyj tokenu
1. W każdym requeście → zakładka Authorization
2. Type: Bearer Token
3. Wklej access token

### Krok 3: Testuj endpointy
- GET `/court/users/` - lista
- POST `/court/users/` - nowy user
- GET `/court/users/1/` - szczegóły
- PATCH `/court/users/1/update/` - edycja
- DELETE `/court/users/1/delete/` - usunięcie

## Konfiguracja deweloperska

### Tworzenie superusera
python manage.py createsuperuser

text

### Reset bazy danych
1. Zatrzymaj serwer (Ctrl+C)
2. Usuń bazę
del db.sqlite3 # Windows
rm db.sqlite3 # Linux/Mac

3. Usuń pliki migracji (zostaw init.py w folderach migrations/)
4. Stwórz migracje
python manage.py makemigrations

5. Zastosuj migracje
python manage.py migrate

6. Stwórz superusera
python manage.py createsuperuser


## Troubleshooting

### Błąd 401 Unauthorized
- Sprawdź czy token nie wygasł
- Upewnij się że format to: `Bearer {token}`
- Sprawdź czy token jest w headerze Authorization


## Kody odpowiedzi HTTP

| Kod | Znaczenie |
|-----|-----------|
| 200 | OK |
| 201 | Created |
| 204 | No Content |
| 400 | Bad Request |
| 401 | Unauthorized |
| 404 | Not Found |
| 500 | Server Error |

## Model User

class User(AbstractUser):
role = ForeignKey(Role)
phone = CharField(max_length=50)
status = CharField(max_length=100)

text

Pola z AbstractUser:
- username (wymagane, unikalne)
- password (zahashowane)
- email
- first_name
- last_name
- is_active
- is_staff
- date_joined
