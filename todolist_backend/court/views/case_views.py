from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from court.models import Case
from court.serializers import CaseSerializer


@api_view(['GET', 'POST'])
def case_list_create(request):
    """
    GET - listowanie wszystkich case'ów
    POST - tworzenie nowego case'a
    """
    if request.method == 'GET':
        cases = Case.objects.all().order_by('-created_at')
        serializer = CaseSerializer(cases, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    elif request.method == 'POST':
        serializer = CaseSerializer(data=request.data)
        if serializer.is_valid():
            # Automatycznie przypisz zalogowanego użytkownika jako creator
            serializer.save(creator=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def case_detail(request, pk):
    """
    GET - pobieranie szczegółów pojedynczego case'a
    """
    try:
        case = Case.objects.get(pk=pk)
    except Case.DoesNotExist:
        return Response(
            {"error": "Case nie został znaleziony"},
            status=status.HTTP_404_NOT_FOUND
        )
    
    serializer = CaseSerializer(case)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['PUT', 'PATCH'])
def case_update(request, pk):
    """
    PUT - pełna aktualizacja case'a
    PATCH - częściowa aktualizacja case'a
    """
    try:
        case = Case.objects.get(pk=pk)
    except Case.DoesNotExist:
        return Response(
            {"error": "Case nie został znaleziony"},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Ustawiamy partial=True dla PATCH, aby umożliwić częściową aktualizację
    partial = request.method == 'PATCH'
    serializer = CaseSerializer(case, data=request.data, partial=partial)
    
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
def case_delete(request, pk):
    """
    DELETE - usuwanie case'a
    """
    try:
        case = Case.objects.get(pk=pk)
    except Case.DoesNotExist:
        return Response(
            {"error": "Case nie został znaleziony"},
            status=status.HTTP_404_NOT_FOUND
        )
    
    case.delete()
    return Response(
        {"message": "Case został pomyślnie usunięty"},
        status=status.HTTP_204_NO_CONTENT
    )
