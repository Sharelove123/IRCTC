import time
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Train
from .serializers import TrainSerializer
from django.conf import settings
from pymongo import MongoClient

# Establish Mongo Connection
try:
    _mongo_client = MongoClient(settings.MONGO_URI, serverSelectionTimeoutMS=2000)
    mongo_db = _mongo_client[settings.MONGO_DB_NAME]
except Exception as e:
    print(f"Failed to connect to MongoDB in views: {e}")
    mongo_db = None

# Helper for MongoDB logging
def log_search_to_mongo(endpoint, params, user_id, execution_time):
    global mongo_db
    if mongo_db is not None:
        try:
            mongo_db.search_logs.insert_one({
                'endpoint': endpoint,
                'params': params,
                'user_id': user_id,
                'execution_time': execution_time,
                'timestamp': time.time()
            })
        except Exception as e:
            print(f"MongoDB logging error: {e}")

class IsAdminUser(IsAuthenticated):
    def has_permission(self, request, view):
        # Allow if user is staff/admin or if they provide a specific ADMIN_API_KEY header
        if super().has_permission(request, view) and request.user.is_staff:
            return True
        admin_api_key = request.headers.get('x-admin-api-key')
        return admin_api_key == settings.ADMIN_API_KEY

class TrainListCreateView(generics.ListCreateAPIView):
    queryset = Train.objects.all()
    serializer_class = TrainSerializer
    
    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdminUser()]
        return [IsAuthenticated()]

    def create(self, request, *args, **kwargs):
        train_number = request.data.get('train_number')
        if train_number:
            try:
                train = Train.objects.get(train_number=train_number)
                serializer = self.get_serializer(train, data=request.data, partial=False)
                serializer.is_valid(raise_exception=True)
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            except Train.DoesNotExist:
                pass
        return super().create(request, *args, **kwargs)

class TrainSearchView(generics.ListAPIView):
    serializer_class = TrainSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = Train.objects.all()
        source = self.request.query_params.get('source')
        destination = self.request.query_params.get('destination')
        date_param = self.request.query_params.get('date')
        
        if source:
            source = source.strip()
            queryset = queryset.filter(source__icontains=source)
        if destination:
            destination = destination.strip()
            queryset = queryset.filter(destination__icontains=destination)
        if date_param:
            queryset = queryset.filter(departure_time__date=date_param)
            
        return queryset

    def list(self, request, *args, **kwargs):
        start_time = time.time()
        
        response = super().list(request, *args, **kwargs)
        
        execution_time = time.time() - start_time
        
        user_id = request.user.id if request.user.is_authenticated else None
        log_search_to_mongo(
            '/api/trains/search/', 
            request.query_params.dict(), 
            user_id, 
            execution_time
        )
        
        return response
