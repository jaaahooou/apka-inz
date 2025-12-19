from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from court.models import Hearing
from court.serializers import HearingSerializer

@api_view(['GET', 'POST'])
def hearing_list_create(request):
    """
    GET - lista wszystkich rozpraw (opcjonalnie filtrowana po judge_id)
    POST - tworzenie nowej rozprawy
    """
    if request.method == 'GET':
        hearings = Hearing.objects.all().order_by('-date_time')
        
        # Opcjonalne filtrowanie po ID sędziego (jeśli podano w URL ?judge_id=1)
        judge_id = request.query_params.get('judge_id')
        if judge_id:
            hearings = hearings.filter(judge_id=judge_id)

        serializer = HearingSerializer(hearings, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    elif request.method == 'POST':
        # Przy tworzeniu rozprawy, jeśli judge nie jest podany, możemy (opcjonalnie) 
        # przypisać sędziego z powiązanej sprawy
        data = request.data.copy()
        
        # Logika biznesowa: Przypisz sędziego ze sprawy, jeśli nie wybrano ręcznie
        if 'case' in data and not data.get('judge'):
            from court.models import Case
            try:
                case_instance = Case.objects.get(pk=data['case'])
                if case_instance.assigned_judge:
                    data['judge'] = case_instance.assigned_judge.id
            except Case.DoesNotExist:
                pass

        serializer = HearingSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def hearing_detail(request, pk):
    try:
        hearing = Hearing.objects.get(pk=pk)
    except Hearing.DoesNotExist:
        return Response(
            {"error": "Rozprawa nie została znaleziona"},
            status=status.HTTP_404_NOT_FOUND
        )
    
    serializer = HearingSerializer(hearing)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['PUT', 'PATCH'])
def hearing_update(request, pk):
    try:
        hearing = Hearing.objects.get(pk=pk)
    except Hearing.DoesNotExist:
        return Response(
            {"error": "Rozprawa nie została znaleziona"},
            status=status.HTTP_404_NOT_FOUND
        )
    
    partial = request.method == 'PATCH'
    serializer = HearingSerializer(hearing, data=request.data, partial=partial)
    
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
def hearing_delete(request, pk):
    try:
        hearing = Hearing.objects.get(pk=pk)
    except Hearing.DoesNotExist:
        return Response(
            {"error": "Rozprawa nie została znaleziona"},
            status=status.HTTP_404_NOT_FOUND
        )
    
    hearing.delete()
    return Response(
        {"message": "Rozprawa została pomyślnie usunięta"},
        status=status.HTTP_204_NO_CONTENT
    )