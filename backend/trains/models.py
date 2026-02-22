from django.db import models

class Train(models.fields.PositiveIntegerField):
    pass
    
class Train(models.Model):
    train_number = models.CharField(max_length=20, unique=True, db_index=True)
    name = models.CharField(max_length=150)
    source = models.CharField(max_length=100, db_index=True)
    destination = models.CharField(max_length=100, db_index=True)
    departure_time = models.DateTimeField()
    arrival_time = models.DateTimeField()
    total_seats = models.PositiveIntegerField()
    available_seats = models.PositiveIntegerField()

    def __str__(self):
        return f"{self.train_number} - {self.name}"
