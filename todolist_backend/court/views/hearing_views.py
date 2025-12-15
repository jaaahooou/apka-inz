from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from court.models import Hearing
from court.serializers import HearingSerializer


@api_view(['GET', 'POST'])
def hearing_list_create(request):
    """
    GET - lista wszystkich rozpraw
    POST - tworzenie nowej rozprawy
    """
    if request.method == 'GET':
        hearings = Hearing.objects.all().order_by('-date_time')
        serializer = HearingSerializer(hearings, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    elif request.method == 'POST':
        serializer = HearingSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def hearing_detail(request, pk):
    """
    GET - szczegóły rozprawy
    """
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
    """
    PUT - pełna aktualizacja rozprawy
    PATCH - częściowa aktualizacja rozprawy
    """
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
    """
    DELETE - usuwanie rozprawy
    """
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