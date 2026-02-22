# IRCTC Backend

A simplified version of the IRCTC backend that supports user registration, authentication, train search and booking, and analytics. Built with Django, Django REST Framework, SQLite, and MongoDB.

## Tech Stack
* **Backend:** Django, Django REST Framework (DRF)
* **Databases:**
  * **SQLite:** Main transactional data (Users, Trains, Bookings)
  * **MongoDB:** API logs and analytics (Search queries)
* **Authentication:** JWT (JSON Web Tokens)

## Setup Instructions

### Prerequisites
* Python 3.10+
* MongoDB running locally or accessible via URI.

### Installation

1. Clone this repository or extract the zip.
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Set up environment variables:
   * Copy `.env.example` to `.env` in the root directory.
   * Update the values in `.env` if necessary (e.g., MongoDB URI).
5. Apply database migrations:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```
6. Create a superuser (for admin APIs):
   ```bash
   python manage.py createsuperuser
   ```
7. Run the development server:
   ```bash
   python manage.py runserver
   ```

## API Endpoints

### Authentication
* **Register:** `POST /api/register/`
  * Body: `{"username": "user1", "email": "user1@example.com", "password": "password123", "first_name": "John", "last_name": "Doe"}`
* **Login:** `POST /api/login/`
  * Body: `{"username": "user1", "password": "password123"}`
  * *Returns JWT `access` and `refresh` tokens.*

### Trains
*All endpoints below (except Registration and Login) require a valid token in the `Authorization: Bearer <token>` header.*

* **Search Trains:** `GET /api/trains/search/?source=StationA&destination=StationB`
  * Valid filters: `source`, `destination`, `date` (YYYY-MM-DD).
  * Logging: Each search query is logged to MongoDB.
* **Create Train:** `POST /api/trains/` *(Admin Only depending on token or x-admin-api-key)*
  * Body:
    ```json
    {
      "train_number": "12345",
      "name": "Express",
      "source": "StationA",
      "destination": "StationB",
      "departure_time": "2024-01-01T10:00:00Z",
      "arrival_time": "2024-01-01T14:00:00Z",
      "total_seats": 100,
      "available_seats": 100
    }
    ```

### Bookings
* **Book Ticket:** `POST /api/bookings/`
  * Body: `{"train": 1, "seats_booked": 2}`
  * Note: `train` is the Train ID. Uses transaction and `select_for_update()` to handle concurrent bookings safely.
* **My Bookings:** `GET /api/bookings/my/`

### Analytics
* **Top Routes:** `GET /api/analytics/top-routes/`
  * Aggregates MongoDB logs to return the top 5 most searched (source, destination) combinations.
