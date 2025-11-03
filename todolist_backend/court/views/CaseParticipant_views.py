from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from court.models import CaseParticipant, Case, User
from court.serializers import CaseParticipantSerializer
from django.utils import timezone

@api_view(['GET', 'POST'])
def case_participants_list(request, case_id):
    """Lista uczestników sprawy lub dodaj nowego"""
    try:
        case = Case.objects.get(pk=case_id)
    except Case.DoesNotExist:
        return Response(
            {'error': 'Sprawa nie znaleziona'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    if request.method == 'GET':
        participants = CaseParticipant.objects.filter(case=case, is_active=True)
        serializer = CaseParticipantSerializer(participants, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        # Sprawdź czy użytkownik już jest uczestnikiem
        if CaseParticipant.objects.filter(case=case, user_id=request.data.get('user')).exists():
            return Response(
                {'error': 'Ten użytkownik jest już uczestnikiem tej sprawy'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = CaseParticipantSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(case=case)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PATCH', 'DELETE'])
def case_participant_detail(request, case_id, participant_id):
    """Szczegóły, aktualizacja lub usunięcie uczestnika"""
    try:
        case = Case.objects.get(pk=case_id)
        participant = CaseParticipant.objects.get(pk=participant_id, case=case)
    except (Case.DoesNotExist, CaseParticipant.DoesNotExist):
        return Response(
            {'error': 'Uczestnik lub sprawa nie znalezieni'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    if request.method == 'GET':
        serializer = CaseParticipantSerializer(participant)
        return Response(serializer.data)
    
    elif request.method == 'PATCH':
        serializer = CaseParticipantSerializer(participant, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        participant.delete()
        return Response(
            {'message': 'Uczestnik usunięty ze sprawy'},
            status=status.HTTP_204_NO_CONTENT
        )


@api_view(['GET'])
def case_participants_by_role(request, case_id, role):
    """Uczestnicy sprawy z konkretną rolą"""
    try:
        case = Case.objects.get(pk=case_id)
    except Case.DoesNotExist:
        return Response(
            {'error': 'Sprawa nie znaleziona'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    participants = CaseParticipant.objects.filter(case=case, role_in_case=role, is_active=True)
    serializer = CaseParticipantSerializer(participants, many=True)
    return Response(serializer.data)


@api_view(['POST'])
def remove_participant_from_case(request, case_id, participant_id):
    """Deaktywuj uczestnika (nie usuwa z bazy)"""
    try:
        case = Case.objects.get(pk=case_id)
        participant = CaseParticipant.objects.get(pk=participant_id, case=case)
    except (Case.DoesNotExist, CaseParticipant.DoesNotExist):
        return Response(
            {'error': 'Uczestnik lub sprawa nie znalezieni'},
            status=status.HTTP_404_NOT_FOUND
        )
    
  
    participant.is_active = False
    participant.left_at = timezone.now()
    participant.save()
    
    serializer = CaseParticipantSerializer(participant)
    return Response(serializer.data, status=status.HTTP_200_OK)