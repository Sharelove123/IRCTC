import os
import django
from django.utils import timezone
from datetime import timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'irctc.settings')
django.setup()

from django.contrib.auth import get_user_model
from trains.models import Train

def seed_data():
    User = get_user_model()
    
    # Create superuser 'abcd'
    if not User.objects.filter(username='abcd').exists():
        User.objects.create_superuser('abcd', 'abcd@gmail.com', 'abcd')
        print("Superuser 'abcd' created.")
    else:
        print("Superuser 'abcd' already exists.")

    # Create dummy trains
    now = timezone.now()
    if not Train.objects.filter(source__iexact='Delhi', destination__iexact='Mumbai').exists():
        Train.objects.create(
            train_number='12345',
            name='Rajdhani Express',
            source='Delhi',
            destination='Mumbai',
            total_seats=100,
            available_seats=100,
            departure_time=now + timedelta(days=1, hours=10),
            arrival_time=now + timedelta(days=1, hours=22)
        )
        Train.objects.create(
            train_number='67890',
            name='Shatabdi Express',
            source='Delhi',
            destination='Mumbai',
            total_seats=200,
            available_seats=200,
            departure_time=now + timedelta(days=2, hours=8),
            arrival_time=now + timedelta(days=2, hours=18)
        )
        print("Trains from Delhi to Mumbai created.")
    else:
        print("Dummy trains already exist.")

if __name__ == '__main__':
    seed_data()
