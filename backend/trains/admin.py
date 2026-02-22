from django.contrib import admin
from .models import Train

# Register your models here.

@admin.register(Train)
class TrainAdmin(admin.ModelAdmin):
    list_display = ('train_number', 'name', 'source', 'destination', 'departure_time', 'arrival_time', 'total_seats', 'available_seats')
    search_fields = ('train_number', 'name', 'source', 'destination')
