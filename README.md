# Aplikacja inżynierska

Baza danych: 
https://dbdiagram.io/d/apka-inzynierska-6857fe0af039ec6d365286bd

# Backend API - Dokumentacja

Backend aplikacji oparty na Django REST Framework z autentykacją JWT.

## Spis treści

- [Instalacja i konfiguracja](#instalacja-i-konfiguracja)
- [Autentykacja JWT](#autentykacja-jwt)
- [Endpointy API](#endpointy-api)
  - [Role](#role)
  - [Użytkownicy](#użytkownicy)
  - [Sprawy (Cases)](#sprawy-cases)
  - [Uczestnicy Sprawy (Case Participants)](#uczestnicy-sprawy-case-participants)
  - [Rozprawy (Hearings)](#rozprawy-hearings)
  - [Dokumenty](#dokumenty)
  - [Powiadomienia (Notifications)](#powiadomienia-notifications)
  - [Dziennik Audytu (Audit Logs)](#dziennik-audytu-audit-logs)
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
Content-type: application/json

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

### Role

#### 1. Lista wszystkich ról
**GET** `/court/roles/`

Wymaga: Bearer Token

Zwraca listę wszystkich dostępnych ról w systemie.

#### 2. Tworzenie nowej roli
**POST** `/court/roles/`

Wymaga: Bearer Token

Body:
{
"name": "Mediator",
"description": "Osoba mediująca w sprawie"
}

text

#### 3. Szczegóły roli
**GET** `/court/roles/{id}/`

#### 4. Aktualizacja roli
**PUT** `/court/roles/{id}/`

#### 5. Usuwanie roli
**DELETE** `/court/roles/{id}/`

---

### Użytkownicy

#### 1. Lista użytkowników
**GET** `/court/users/`

Wymaga: Bearer Token

#### 2. Szczegóły użytkownika
**GET** `/court/users/{id}/`

#### 3. Tworzenie użytkownika
**POST** `/court/users/`

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

#### 4. Aktualizacja użytkownika (częściowa)
**PATCH** `/court/users/{id}/update/`

#### 5. Aktualizacja użytkownika (pełna)
**PUT** `/court/users/{id}/update/`

#### 6. Usunięcie użytkownika
**DELETE** `/court/users/{id}/delete/`

---

### Sprawy (Cases)

#### 1. Lista spraw
**GET** `/court/cases/`

Wymaga: Bearer Token

#### 2. Szczegóły sprawy
**GET** `/court/cases/{id}/`

#### 3. Tworzenie sprawy
**POST** `/court/cases/`

Body:
{
"case_number": "CASE-2025-001",
"title": "Nazwa sprawy",
"description": "Szczegółowy opis sprawy",
"status": "nowa"
}

text

#### 4. Aktualizacja sprawy (częściowa)
**PATCH** `/court/cases/{id}/update/`

#### 5. Aktualizacja sprawy (pełna)
**PUT** `/court/cases/{id}/update/`

#### 6. Usunięcie sprawy
**DELETE** `/court/cases/{id}/delete/`

---

### Uczestnicy Sprawy (Case Participants)

#### 1. Lista uczestników sprawy
**GET** `/court/cases/{case_id}/participants/`

Wymaga: Bearer Token

#### 2. Dodaj uczestnika do sprawy
**POST** `/court/cases/{case_id}/participants/`

Body:
{
"user": 2,
"role_in_case": "lawyer",
"description": "Adwokat reprezentujący powoda",
"contact_email": "adwokat@example.com",
"contact_phone": "+48123456789"
}

text

Dostępne role:
- `plaintiff` - Powód
- `defendant` - Pozwany
- `prosecutor` - Prokuratura
- `accused` - Oskarżony
- `lawyer` - Adwokat
- `representative` - Pełnomocnik
- `witness` - Świadek
- `other` - Inne

#### 3. Szczegóły uczestnika
**GET** `/court/cases/{case_id}/participants/{participant_id}/`

#### 4. Zaktualizuj uczestnika
**PATCH** `/court/cases/{case_id}/participants/{participant_id}/`

#### 5. Usuń uczestnika ze sprawy
**DELETE** `/court/cases/{case_id}/participants/{participant_id}/`

#### 6. Uczestnicy z konkretną rolą
**GET** `/court/cases/{case_id}/participants/role/{role}/`

#### 7. Deaktywuj uczestnika (bez usuwania)
**POST** `/court/cases/{case_id}/participants/{participant_id}/remove/`

---

### Rozprawy (Hearings)

#### 1. Lista wszystkich rozpraw
**GET** `/court/hearings/`

Wymaga: Bearer Token

#### 2. Szczegóły rozprawy
**GET** `/court/hearings/{id}/`

#### 3. Tworzenie rozprawy
**POST** `/court/hearings/`

Body:
{
"case": 1,
"date_time": "2025-11-10T14:00:00Z",
"location": "Sala 5",
"status": "zaplanowana",
"judge": 1,
"notes": "Pierwsza rozprawa"
}

text

Status: `zaplanowana`, `odbyta`, `odłożona`

#### 4. Aktualizacja rozprawy (częściowa)
**PATCH** `/court/hearings/{id}/update/`

#### 5. Aktualizacja rozprawy (pełna)
**PUT** `/court/hearings/{id}/update/`

#### 6. Usuwanie rozprawy
**DELETE** `/court/hearings/{id}/delete/`

---

### Dokumenty

#### 1. Lista wszystkich dokumentów
**GET** `/court/documents/`

Wymaga: Bearer Token

#### 2. Szczegóły dokumentu
**GET** `/court/documents/{id}/`

#### 3. Dodawanie dokumentu
**POST** `/court/documents/`

Body: `form-data` (NIE raw JSON!)

| Key | Type | Value |
|-----|------|-------|
| `title` | text | "Nazwa dokumentu" |
| `description` | text | "Opis (opcjonalnie)" |
| `case` | text | 1 |
| `file` | file | Wybierz plik z dysku |

#### 4. Pobieranie dokumentu
**GET** `/court/documents/{id}/download/`

#### 5. Dokumenty dla konkretnej sprawy
**GET** `/court/cases/{case_id}/documents/`

#### 6. Usuwanie dokumentu
**DELETE** `/court/documents/{id}/delete/`

---

### Powiadomienia (Notifications)

#### 1. Lista powiadomień zalogowanego użytkownika
**GET** `/court/notifications/`

Wymaga: Bearer Token

#### 2. Liczba nieprzeczytanych powiadomień
**GET** `/court/notifications/unread-count/`

Odpowiedź:
{
"unread_count": 5
}

text

#### 3. Szczegóły powiadomienia
**GET** `/court/notifications/{id}/`

#### 4. Oznacz powiadomienie jako przeczytane
**PUT** `/court/notifications/{id}/read/`

#### 5. Oznacz wszystkie powiadomienia jako przeczytane
**PUT** `/court/notifications/read-all/`

---

### Dziennik Audytu (Audit Logs)

Dziennik audytu rejestruje wszystkie akcje w systemie (CREATE, UPDATE, DELETE) dla celów bezpieczeństwa i kontroli. **Wymaga uprawnień administratora** (is_staff=True). Automatycznie rejestruje zmiany poprzez middleware.

#### 1. Lista wszystkich wpisów audytu
**GET** `/court/audit-logs/`

Wymaga: Bearer Token + Administrator

Zwraca listę wszystkich wpisów audytu posortowanych od najnowszych.

Filtry opcjonalne:
- `?user=2` - wpisy konkretnego użytkownika
- `?action=UPDATE` - tylko określona akcja
- `?object_type=Case` - tylko określony typ obiektu
- `?days=7` - ostatnie N dni (domyślnie 30)

Przykład:
GET /court/audit-logs/?action=UPDATE&object_type=Hearing&days=7

text

Odpowiedź:
[
{
"id": 1,
"user": 1,
"user_username": "jaaah",
"action": "UPDATE",
"action_display": "Aktualizacja",
"object_type": "Hearing",
"object_type_display": "Rozprawa",
"object_id": 1,
"object_name": "Hearing #1",
"description": "Zaktualizowana rozprawa",
"old_value": "{\n "status": "zaplanowana"\n}",
"new_value": "{\n "status": "odbyta"\n}",
"ip_address": "127.0.0.1",
"user_agent": "PostmanRuntime/7.49.1",
"timestamp": "2025-11-03T10:44:37.757767Z"
}
]

text

#### 2. Historia konkretnego obiektu
**GET** `/court/audit-logs/object/{object_type}/{object_id}/`

Wymaga: Bearer Token + Administrator

Zwraca wszystkie zmiany dokonane na konkretnym obiekcie.

Przykład:
GET /court/audit-logs/object/Case/1/

text

#### 3. Historia użytkownika
**GET** `/court/audit-logs/user/{user_id}/`

Wymaga: Bearer Token + Administrator (lub własne dane)

Zwraca wszystkie akcje dokonane przez konkretnego użytkownika.

#### 4. Statystyki audytu
**GET** `/court/audit-logs/statistics/`

Wymaga: Bearer Token + Administrator

Zwraca podsumowanie audytu - liczbę akcji, obiekty, użytkowników.

#### Dostępne akcje
- `CREATE` - Utworzenie
- `UPDATE` - Aktualizacja
- `DELETE` - Usunięcie
- `VIEW` - Przeglądanie
- `DOWNLOAD` - Pobranie
- `LOGIN` - Logowanie
- `LOGOUT` - Wylogowanie

#### Dostępne typy obiektów
- `Case` - Sprawa
- `Hearing` - Rozprawa
- `Document` - Dokument
- `User` - Użytkownik
- `Role` - Rola
- `CaseParticipant` - Uczestnik sprawy
- `Notification` - Powiadomienie

---

## Testowanie w Postman

### Krok 1: Uzyskaj token
POST /api/token/

text

### Krok 2: Użyj tokenu
W każdym requeście: Authorization → Bearer Token → wklej access token

### Krok 3: Testuj endpointy

**Role:**
- GET `/court/roles/`
- POST `/court/roles/`
- GET `/court/roles/1/`
- PUT `/court/roles/1/`
- DELETE `/court/roles/1/`

**Użytkownicy:**
- GET `/court/users/`
- POST `/court/users/`
- GET `/court/users/1/`
- PATCH `/court/users/1/update/`
- DELETE `/court/users/1/delete/`

**Sprawy:**
- GET `/court/cases/`
- POST `/court/cases/`
- GET `/court/cases/1/`
- PATCH `/court/cases/1/update/`
- DELETE `/court/cases/1/delete/`

**Uczestnicy Sprawy:**
- GET `/court/cases/1/participants/`
- POST `/court/cases/1/participants/`
- GET `/court/cases/1/participants/1/`
- PATCH `/court/cases/1/participants/1/`
- DELETE `/court/cases/1/participants/1/`
- GET `/court/cases/1/participants/role/lawyer/`
- POST `/court/cases/1/participants/1/remove/`

**Rozprawy:**
- GET `/court/hearings/`
- POST `/court/hearings/`
- GET `/court/hearings/1/`
- PATCH `/court/hearings/1/update/`
- DELETE `/court/hearings/1/delete/`

**Dokumenty:**
- GET `/court/documents/`
- POST `/court/documents/` (form-data!)
- GET `/court/documents/1/`
- GET `/court/documents/1/download/`
- GET `/court/cases/1/documents/`
- DELETE `/court/documents/1/delete/`

**Powiadomienia:**
- GET `/court/notifications/`
- GET `/court/notifications/unread-count/`
- GET `/court/notifications/1/`
- PUT `/court/notifications/1/read/`
- PUT `/court/notifications/read-all/`

**Dziennik Audytu (Admin only):**
- GET `/court/audit-logs/`
- GET `/court/audit-logs/?action=UPDATE&days=7`
- GET `/court/audit-logs/object/Case/1/`
- GET `/court/audit-logs/user/2/`
- GET `/court/audit-logs/statistics/`

## Konfiguracja deweloperska

### Tworzenie superusera
python manage.py createsuperuser

text

### Reset bazy danych
1. Zatrzymaj serwer (Ctrl+C)
2. Usuń bazę
del db.sqlite3 # Windows
rm db.sqlite3 # Linux/Mac

3. Usuń pliki migracji (zostaw init.py)
4. Stwórz migracje
python manage.py makemigrations

5. Zastosuj migracje
python manage.py migrate

6. Stwórz superusera
python manage.py createsuperuser

text

## Troubleshooting

### Błąd 401 Unauthorized
- Sprawdź czy token nie wygasł
- Upewnij się że format to: `Bearer {token}`
- Sprawdź czy token jest w headerze Authorization

### Błąd 403 Forbidden (Audit Logs)
- Upewnij się że jesteś administratorem (is_staff=True)

### Błąd 404 Not Found
- Sprawdź poprawność URL
- Upewnij się że zasób o podanym ID istnieje

### Błąd 400 Bad Request
- Sprawdź czy wszystkie wymagane pola są wypełnione
- Upewnij się że format danych jest poprawny (JSON)
- Sprawdź czy case_number jest unikalny
- Dla dokumentów upewnij się że używasz `form-data`
- Data i godzina rozprawy musi być w formacie ISO 8601

### Błąd podczas uploadu dokumentu
- Upewnij się że pole `file` ma type `file` w Postmanie
- Sprawdź czy plik nie jest zbyt duży
- Upewnij się że folder `media/` istnieje

## Kody odpowiedzi HTTP

| Kod | Znaczenie |
|-----|-----------|
| 200 | OK |
| 201 | Created |
| 204 | No Content |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Server Error |

## Modele

### Role
- name (CharField, unique)
- description (TextField, opcjonalne)

### User
- role (ForeignKey do Role)
- phone (CharField)
- status (CharField)
- Plus pola z AbstractUser: username, password, email, first_name, last_name

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
