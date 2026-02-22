import requests
import time

BASE_URL = 'http://localhost:8000/api'

# 1. Register User
# 2. Login User
# 3. Create Train (Admin)
# 4. Search Train
# 5. Book Train
# 6. View Analytics

def run_tests():
    # Register
    print("Registering user...")
    res = requests.post(f"{BASE_URL}/register/", json={
        "username": "testuser",
        "email": "test@example.com",
        "password": "testpassword",
    })
    print("Register Response:", res.json())
    
    # Login User
    print("\nLogging in...")
    res = requests.post(f"{BASE_URL}/login/", json={
        "username": "testuser",
        "password": "testpassword"
    })
    print("Login Response:", res.status_code)
    token = res.json().get('access')
    
    headers = {"Authorization": f"Bearer {token}"}
    admin_headers = {"Authorization": f"Bearer {token}", "x-admin-api-key": "default_admin_secret"}
    
    # Create Train
    print("\nCreating train (admin)...")
    train_data = {
      "train_number": "10001",
      "name": "Super Fast",
      "source": "CityA",
      "destination": "CityB",
      "departure_time": "2024-05-01T10:00:00Z",
      "arrival_time": "2024-05-01T14:00:00Z",
      "total_seats": 50,
      "available_seats": 50
    }
    res = requests.post(f"{BASE_URL}/trains/", json=train_data, headers=admin_headers)
    print("Create Train Response:", res.status_code, res.json())
    
    train_id = res.json().get('id') if res.status_code == 201 else 1

    # Search Train
    print("\nSearching trains...")
    res = requests.get(f"{BASE_URL}/trains/search/?source=CityA&destination=CityB", headers=headers)
    print("Search Train Response:", res.status_code, res.json())
    
    # Search again to build logs
    res = requests.get(f"{BASE_URL}/trains/search/?source=CityA&destination=CityB", headers=headers)

    # Book Train
    print("\nBooking train...")
    res = requests.post(f"{BASE_URL}/bookings/", json={"train": train_id, "seats_booked": 2}, headers=headers)
    print("Book Train Response:", res.status_code, res.json())
    
    # Check Analytics
    print("\nChecking Analytics...")
    res = requests.get(f"{BASE_URL}/analytics/top-routes/", headers=admin_headers)
    print("Analytics Response:", res.status_code, res.json())

if __name__ == '__main__':
    run_tests()
