from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    # AbstractUser gives us username, first_name, last_name, email, password
    pass
