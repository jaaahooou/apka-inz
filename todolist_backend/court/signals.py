from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import Case, Hearing, Document, Notification, CaseParticipant, Message
from .serializers import NotificationSerializer

# Funkcja pomocnicza do wysyłania przez WebSocket
def send_websocket_notification(user_id, notification):
    channel_layer = get_channel_layer()
    group_name = f"notifications_{user_id}"
    
    try:
        # ZMIANA: Używamy serializera, aby dane w WebSocket były kompletne (np. nazwa nadawcy)
        serializer = NotificationSerializer(notification)
        data = serializer.data

        async_to_sync(channel_layer.group_send)(
            group_name,
            {
                "type": "send_notification", 
                "notification": data 
            }
        )
    except Exception as e:
        print(f"❌ Błąd wysyłania do WebSocket: {e}")

# 1. ZMIANA STATUSU SPRAWY
@receiver(pre_save, sender=Case)
def notify_case_status_change(sender, instance, **kwargs):
    if not instance.pk: return
    try:
        old_case = Case.objects.get(pk=instance.pk)
    except Case.DoesNotExist: return

    if old_case.status != instance.status and instance.creator:
        notif = Notification.objects.create(
            user=instance.creator,
            title="Zmiana statusu sprawy",
            message=f"Status sprawy {instance.case_number} zmieniony na: {instance.status}",
            notification_type='status_changed',
            case=instance
        )
        send_websocket_notification(instance.creator.id, notif)

@receiver(post_save, sender=Case)
def notify_case_updated(sender, instance, created, **kwargs):
    # Opcjonalnie: obsługa edycji innej niż status
    pass

# 2. NOWA ROZPRAWA
@receiver(post_save, sender=Hearing)
def notify_new_hearing(sender, instance, created, **kwargs):
    if created:
        # Do sędziego
        if instance.judge:
            notif = Notification.objects.create(
                user=instance.judge,
                title="Nowa rozprawa",
                message=f"Rozprawa w sprawie {instance.case.case_number} dnia {instance.date_time}",
                notification_type='hearing_reminder',
                hearing=instance,
                case=instance.case
            )
            send_websocket_notification(instance.judge.id, notif)
        
        # Do twórcy sprawy
        if instance.case.creator:
            notif = Notification.objects.create(
                user=instance.case.creator,
                title="Wyznaczono rozprawę",
                message=f"Rozprawa w sprawie {instance.case.case_number} dnia {instance.date_time}",
                notification_type='hearing_reminder',
                hearing=instance,
                case=instance.case
            )
            send_websocket_notification(instance.case.creator.id, notif)

# 3. NOWY DOKUMENT
@receiver(post_save, sender=Document)
def notify_new_document(sender, instance, created, **kwargs):
    if created:
        case = instance.case
        # Powiadom sędziego, jeśli to nie on dodał
        if case.assigned_judge and case.assigned_judge != instance.uploaded_by:
            notif = Notification.objects.create(
                user=case.assigned_judge,
                title="Nowy dokument",
                message=f"Dodano dokument: {instance.title} w sprawie {case.case_number}",
                notification_type='document_added',
                document=instance,
                case=case,
                sender=instance.uploaded_by # ZMIANA: Ustawiamy nadawcę
            )
            send_websocket_notification(case.assigned_judge.id, notif)

# 4. NOWY UCZESTNIK SPRAWY
@receiver(post_save, sender=CaseParticipant)
def notify_new_participant(sender, instance, created, **kwargs):
    if created:
        notif = Notification.objects.create(
            user=instance.user,
            title="Dodano do sprawy",
            message=f"Zostałeś dodany jako {instance.get_role_in_case_display()} do sprawy {instance.case.case_number}",
            notification_type='new_participant',
            case=instance.case
        )
        send_websocket_notification(instance.user.id, notif)

# 5. NOWA WIADOMOŚĆ (Chat)
@receiver(post_save, sender=Message)
def notify_new_message(sender, instance, created, **kwargs):
    if created and instance.recipient:
        notif = Notification.objects.create(
            user=instance.recipient,
            # Tutaj używamy __str__ modelu User (poprawionego w models.py)
            title=f"Wiadomość od {instance.sender}",
            message=f"{instance.content[:50]}..." if instance.content else "Przesłano załącznik",
            notification_type='message',
            sender=instance.sender # ZMIANA: Ustawiamy nadawcę
        )
        send_websocket_notification(instance.recipient.id, notif)