# Aplikacja inżynierska: 
Baza danych: 
https://dbdiagram.io/d/apka-inzynierska-6857fe0af039ec6d365286bd

# Backend API - Dokumentacja

Backend aplikacji oparty na Django REST Framework z autentykacją JWT.

## Spis treści

- [Instalacja i konfiguracja](#instalacja-i-konfiguracja)
- [Autentykacja JWT](#autentykacja-jwt)
- [Endpointy API](#endpointy-api)
  - [Użytkownicy](#użytkownicy)
  - [Sprawy (Cases)](#sprawy-cases)
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
Content-type: application/json - zawsze i wszędzie!!!!!!!!!!!

text

Body:
{
"username": "admin",
"password": "haslo123"
}

text

Odpowiedź:
{
"access": "token_tutaj...",
"refresh": "refresh_token_tutaj..."
}

text

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

---

### Sprawy (Cases)

#### 1. Lista spraw
**GET** `/court/cases/`

Wymaga: Bearer Token

Zwraca listę wszystkich spraw posortowanych od najnowszych.

Odpowiedź:
[
{
"id": 1,
"case_number": "CASE-2025-001",
"title": "Sprawa testowa",
"description": "Opis sprawy",
"status": "nowa",
"creator": 1,
"creator_username": "admin",
"created_at": "2025-11-02T20:28:15.123456Z"
}
]

text

#### 2. Szczegóły sprawy
**GET** `/court/cases/{id}/`

Wymaga: Bearer Token

Zwraca szczegóły pojedynczej sprawy.

#### 3. Tworzenie sprawy
**POST** `/court/cases/`

Wymaga: Bearer Token

Body:
{
"case_number": "CASE-2025-001",
"title": "Nazwa sprawy",
"description": "Szczegółowy opis sprawy",
"status": "nowa"
}

text

Pola wymagane:
- case_number (unikalna)
- title
- description
- status

Pole `creator` jest automatycznie ustawiane na podstawie zalogowanego użytkownika.

Odpowiedź (201 Created):
{
"id": 1,
"case_number": "CASE-2025-001",
"title": "Nazwa sprawy",
"description": "Szczegółowy opis sprawy",
"status": "nowa",
"creator": 1,
"creator_username": "admin",
"created_at": "2025-11-02T20:28:15.123456Z"
}

text

#### 4. Aktualizacja sprawy (częściowa)
**PATCH** `/court/cases/{id}/update/`

Wymaga: Bearer Token

Edytowalne pola: case_number, title, description, status

Body (przykład):
{
"status": "w trakcie",
"description": "Zaktualizowany opis"
}

text

#### 5. Aktualizacja sprawy (pełna)
**PUT** `/court/cases/{id}/update/`

Wymaga: Bearer Token

Body:
{
"case_number": "CASE-2025-001",
"title": "Zaktualizowana nazwa",
"description": "Zaktualizowany opis",
"status": "zakończona"
}

text

#### 6. Usunięcie sprawy
**DELETE** `/court/cases/{id}/delete/`

Wymaga: Bearer Token

Odpowiedź (204 No Content):
{
"message": "Case został pomyślnie usunięty"
}

text

---

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

**Użytkownicy:**
- GET `/court/users/` - lista
- POST `/court/users/` - nowy user
- GET `/court/users/1/` - szczegóły
- PATCH `/court/users/1/update/` - edycja
- DELETE `/court/users/1/delete/` - usunięcie

**Sprawy:**
- GET `/court/cases/` - lista spraw
- POST `/court/cases/` - nowa sprawa
- GET `/court/cases/1/` - szczegóły sprawy
- PATCH `/court/cases/1/update/` - edycja sprawy
- DELETE `/court/cases/1/delete/` - usunięcie sprawy

## Konfiguracja deweloperska

### Tworzenie superusera
python manage.py createsuperuser

text

### Reset bazy danych
1. Zatrzymaj serwer (Ctrl+C)
2. Usuń bazę
del db.sqlite3 # Windows
rm db.sqlite3 # Linux/Mac

text
3. Usuń pliki migracji (zostaw __init__.py w folderach migrations/)
4. Stwórz migracje
python manage.py makemigrations

text
5. Zastosuj migracje
python manage.py migrate

text
6. Stwórz superusera
python manage.py createsuperuser

text

## Troubleshooting

### Błąd 401 Unauthorized
- Sprawdź czy token nie wygasł
- Upewnij się że format to: `Bearer {token}`
- Sprawdź czy token jest w headerze Authorization

### Błąd 404 Not Found
- Sprawdź poprawność URL
- Upewnij się że zasób o podanym ID istnieje

### Błąd 400 Bad Request
- Sprawdź czy wszystkie wymagane pola są wypełnione
- Upewnij się że format danych jest poprawny (JSON)
- Sprawdź czy case_number jest unikalny

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

## Modele

### User
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

### Case
class Case(models.Model):
case_number = CharField(max_length=100, unique=True)
title = CharField(max_length=200)
description = TextField()
status = CharField(max_length=100)
creator = ForeignKey(User, on_delete=SET_NULL, null=True)
created_at = DateTimeField(auto_now_add=True)

text

Pola:
- case_number (wymagane, unikalne)
- title (wymagane)
- description (wymagane)
- status (wymagane)
- creator (automatycznie ustawiane, nullable)
- created_at (automatycznie ustawiane)
