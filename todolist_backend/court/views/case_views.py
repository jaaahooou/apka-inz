from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from court.models import Case
from court.serializers import CaseSerializer

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def case_list_create(request):
    """
    GET: Pobierz wszystkie sprawy
    POST: Utwórz nową sprawę
    """
    if request.method == 'GET':
        cases = Case.objects.all()
        serializer = CaseSerializer(cases, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = CaseSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(creator=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def case_detail(request, pk):
    """
    Obsługa konkretnej sprawy: Podgląd, Edycja (Zmiana Sędziego), Usuwanie
    """
    try:
        case = Case.objects.get(pk=pk)
    except Case.DoesNotExist:
        return Response({'error': 'Sprawa nie istnieje'}, status=status.HTTP_404_NOT_FOUND)

    # 1. PODGLĄD SPRAWY
    if request.method == 'GET':
        serializer = CaseSerializer(case)
        return Response(serializer.data)

    # 2. EDYCJA SPRAWY (np. Zmiana Sędziego Referenta)
    elif request.method in ['PUT', 'PATCH']:
        serializer = CaseSerializer(case, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # 3. USUWANIE SPRAWY
    elif request.method == 'DELETE':
        case.delete()
        return Response({'message': 'Sprawa usunięta'}, status=status.HTTP_204_NO_CONTENT)