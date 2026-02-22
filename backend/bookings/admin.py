from django.contrib import admin
from .models import Booking

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('user', 'train', 'seats_booked', 'booking_time')
    search_fields = ('user__username', 'train__train_number', 'train__name')
