from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status
from django.http import FileResponse
from django.shortcuts import get_object_or_404
from court.models import Document
from court.serializers import DocumentSerializer


@api_view(['GET', 'POST'])
@parser_classes([MultiPartParser, FormParser])
def document_list_create(request):
    """
    GET - lista wszystkich dokumentów
    POST - upload nowego dokumentu
    """
    if request.method == 'GET':
        documents = Document.objects.all().order_by('-uploaded_at')
        serializer = DocumentSerializer(documents, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    elif request.method == 'POST':
        serializer = DocumentSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save(uploaded_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def document_detail(request, pk):
    """
    GET - szczegóły dokumentu
    """
    try:
        document = Document.objects.get(pk=pk)
    except Document.DoesNotExist:
        return Response(
            {"error": "Dokument nie został znaleziony"},
            status=status.HTTP_404_NOT_FOUND
        )
    
    serializer = DocumentSerializer(document, context={'request': request})
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
def document_download(request, pk):
    """
    GET - pobieranie pliku dokumentu
    """
    document = get_object_or_404(Document, pk=pk)
    
    try:
        response = FileResponse(document.file.open('rb'), as_attachment=True)
        response['Content-Disposition'] = f'attachment; filename="{document.file.name.split("/")[-1]}"'
        return response
    except Exception as e:
        return Response(
            {"error": f"Błąd podczas pobierania pliku: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['DELETE'])
def document_delete(request, pk):
    """
    DELETE - usuwanie dokumentu
    """
    try:
        document = Document.objects.get(pk=pk)
    except Document.DoesNotExist:
        return Response(
            {"error": "Dokument nie został znaleziony"},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Usuń plik z dysku
    if document.file:
        document.file.delete()
    
    document.delete()
    return Response(
        {"message": "Dokument został pomyślnie usunięty"},
        status=status.HTTP_204_NO_CONTENT
    )


@api_view(['GET'])
def case_documents(request, case_id):
    """
    GET - lista dokumentów dla konkretnej sprawy
    """
    documents = Document.objects.filter(case_id=case_id).order_by('-uploaded_at')
    serializer = DocumentSerializer(documents, many=True, context={'request': request})
    return Response(serializer.data, status=status.HTTP_200_OK)
