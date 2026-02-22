from rest_framework import generics
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.conf import settings
from pymongo import MongoClient
import certifi

# Establish Mongo Connection
try:
    _mongo_client = MongoClient(settings.MONGO_URI, serverSelectionTimeoutMS=2000, tlsCAFile=certifi.where())
    mongo_db = _mongo_client[settings.MONGO_DB_NAME]
except Exception as e:
    print(f"Failed to connect to MongoDB in analytics views: {e}")
    mongo_db = None

class IsAdminUser(IsAuthenticated):
    def has_permission(self, request, view):
        if super().has_permission(request, view) and request.user.is_staff:
            return True
        admin_api_key = request.headers.get('x-admin-api-key')
        return admin_api_key == settings.ADMIN_API_KEY

class TopRoutesView(generics.GenericAPIView):
    permission_classes = [IsAdminUser] # Assuming only admins can view analytics
    
    def get(self, request, *args, **kwargs):
        global mongo_db
        if mongo_db is None:
            return Response({'error': 'MongoDB not configured or connected'}, status=500)
            
        logs_collection = mongo_db.search_logs
        
        # Aggregate logs by source and destination, sorted by count desc, limit 5
        pipeline = [
            {
                "$match": {
                    "params.source": {"$exists": True},
                    "params.destination": {"$exists": True}
                }
            },
            {
                "$group": {
                    "_id": {
                        "source": "$params.source",
                        "destination": "$params.destination"
                    },
                    "search_count": {"$sum": 1}
                }
            },
            {
                "$sort": {"search_count": -1}
            },
            {
                "$limit": 5
            },
            {
                "$project": {
                    "_id": 0,
                    "source": "$_id.source",
                    "destination": "$_id.destination",
                    "search_count": 1
                }
            }
        ]
        
        try:
            top_routes = list(logs_collection.aggregate(pipeline))
        except Exception as e:
            print(f"MongoDB aggregation error: {e}")
            return Response({'error': f'MongoDB query failed: {str(e)}'}, status=500)
        
        return Response(top_routes)
