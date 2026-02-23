from django.db import transaction
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Booking
from .serializers import BookingSerializer
from trains.models import Train
from django.shortcuts import get_object_or_404

class BookingCreateView(generics.CreateAPIView):
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        train_id = request.data.get('train')
        seats_to_book = int(request.data.get('seats_booked', 0))
        
        if seats_to_book <= 0:
            return Response({'error': 'Invalid number of seats'}, status=status.HTTP_400_BAD_REQUEST)
            
        with transaction.atomic():
            # Use select_for_update to lock the train row until the transaction completes
            train = get_object_or_404(Train.objects.select_for_update(), id=train_id)
            
            if train.available_seats >= seats_to_book:
                from django.db.models import F
                train.available_seats = F('available_seats') - seats_to_book
                train.save(update_fields=['available_seats'])
                train.refresh_from_db()
                
                # Create the booking
                booking = Booking.objects.create(
                    user=request.user,
                    train=train,
                    seats_booked=seats_to_book
                )
                
                serializer = self.get_serializer(booking)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            else:
                return Response({'error': 'Not enough seats available'}, status=status.HTTP_400_BAD_REQUEST)

class MyBookingsView(generics.ListAPIView):
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Booking.objects.filter(user=self.request.user)
