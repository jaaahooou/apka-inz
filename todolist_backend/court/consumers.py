import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from court.models import Message
from court.serializers import MessageSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

# --- CONSUMER CZATU (bez zmian, dla kontekstu) ---
class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        if self.user.is_anonymous:
            await self.close()
            return
        
        raw_room_id = self.scope["url_route"]["kwargs"]["room_id"]
        try:
            ids = raw_room_id.split("_")
            sorted_ids = sorted(map(int, ids))
            self.room_id = f"{sorted_ids[0]}_{sorted_ids[1]}"
            self.room_group_name = f"chat_{self.room_id}"
        except ValueError:
            await self.close()
            return

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get('type')

        if message_type == 'chat_message':
            recipient_id = data.get('recipient_id')
            content = data.get('content')
            temp_id = data.get('temp_id')

            message = await self.save_message(recipient_id, content)

            if message:
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'chat_message_event',
                        'message': message,
                        'temp_id': temp_id
                    }
                )

    async def chat_message_event(self, event):
        response = {
            "type": "chat_message",
            "message": event["message"],
        }
        if "temp_id" in event:
            response["temp_id"] = event["temp_id"]
        await self.send(text_data=json.dumps(response))

    @database_sync_to_async
    def save_message(self, recipient_id, content):
        try:
            recipient = User.objects.get(id=int(recipient_id))
            message = Message.objects.create(
                sender=self.user,
                recipient=recipient,
                content=content,
            )
            serializer = MessageSerializer(message)
            return serializer.data
        except Exception as e:
            print(f"❌ save_message error: {e}")
            return None


# --- NOWY CONSUMER POWIADOMIEŃ ---
class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        
        # Tylko zalogowani
        if self.user.is_anonymous:
            await self.close()
            return

        # Tworzymy unikalną grupę dla użytkownika
        self.group_name = f"notifications_{self.user.id}"

        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_discard(
                self.group_name,
                self.channel_name
            )

    # Metoda wywoływana przez signals.py
    async def send_notification(self, event):
        await self.send(text_data=json.dumps({
            "type": "notification",
            "data": event["notification"]
        }))