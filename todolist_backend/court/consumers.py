# court/consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from court.models import Message
from court.serializers import MessageSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        raw_room_id = self.scope["url_route"]["kwargs"]["room_id"]

        # ✅ zawsze ta sama nazwa pokoju niezależnie od kolejności ID
        ids = raw_room_id.split("_")
        sorted_ids = sorted(map(int, ids))
        self.room_id = f"{sorted_ids[0]}_{sorted_ids[1]}"
        self.room_group_name = f"chat_{self.room_id}"

        # ✅ dołącz użytkownika do grupy
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

        print(f"✅ User {self.user.username} joined {self.room_group_name}")

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        print(f"❌ User {self.user.username} disconnected from {self.room_group_name}")

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message_type = data.get('type')

            if message_type == 'chat_message':
                recipient_id = data.get('recipient_id')
                content = data.get('content')

                message = await self.save_message(recipient_id, content)

                if message:
                    # ✅ wyślij do wszystkich w grupie (w tym siebie)
                    await self.channel_layer.group_send(
                        self.room_group_name,
                        {
                            'type': 'chat_message_event',
                            'message': message,
                        }
                    )

        except Exception as e:
            print(f"❌ Error in receive(): {e}")

    async def chat_message_event(self, event):
        """Odbieranie eventu i wysyłanie do WebSocket klienta"""
        await self.send(text_data=json.dumps({
            "type": "chat_message",
            "message": event["message"],
        }))

    @database_sync_to_async
    def save_message(self, recipient_id, content):
        try:
            recipient = User.objects.get(id=recipient_id)
            message = Message.objects.create(
                sender=self.user,
                recipient=recipient,
                content=content,
            )
            serializer = MessageSerializer(message)
            return serializer.data
        except Exception as e:
            print(f"❌ save_message() error: {e}")
            return None
