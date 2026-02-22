# IRCTC Backend Clone

This is a simplified backend clone of the IRCTC platform, fulfilling the requirements for the Backend Intern Assignment.

## 🚀 Tech Stack
* **Backend Framework:** Django / Django REST Framework (DRF)
* **Primary Database (MySQL):** Used for transactional data including Users, Trains, and Bookings. (Uses `mysqlclient`)
* **Analytics Database (MongoDB):** Used via `pymongo` (MongoDB Atlas) to log search requests and aggregate top routes.
* **Authentication:** JWT-based (using `djangorestframework-simplejwt`)

## 🛠️ Setup Instructions

### 1. Prerequisites
- Python 3.10+
- MySQL Server running locally (or remote)
- MongoDB running locally or via Atlas.

### 2. Environment Variables
Rename the provided `.env.example` file to `.env` inside the `backend` folder and populate your database credentials:
```env
# backend/.env
SECRET_KEY=your-django-secret-key
DEBUG=True

# MySQL Credentials
DB_NAME=irctc_db
DB_USER=root
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=3306

# MongoDB URI for Logging
MONGO_URI=mongodb+srv://admin:pass@cluster.mongodb.net/
MONGO_DB_NAME=irctc_logs

# Admin API Key for securing POST /api/trains/
ADMIN_API_KEY=default_admin_secret
```

### 3. Installation
Navigate into the `backend` folder and run the following:

```bash
# 1. Create a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Apply MySQL migrations
python manage.py migrate

# 4. Optional: Seed the database with a dummy superuser & trains
python create_initial_data.py
# (Creates user 'abcd' with password 'abcd')

# 5. Start the server
python manage.py runserver
```

---

## 📡 API Endpoints & Sample Calls

### Authentication APIs
**1. Register a Node User**
* **Endpoint:** `POST /api/register/`
* **Body:** `{"username": "testuser", "email": "test@test.com", "password": "password123"}`
* **Returns:** `{ "access": "<jwt_token>", "refresh": "<jwt_token>" }`

**2. Login User**
* **Endpoint:** `POST /api/login/`
* **Body:** `{"username": "testuser", "password": "password123"}`
* **Returns:** `{ "access": "<jwt_token>", "refresh": "<jwt_token>" }`

> **Note:** All the following endpoints require that you pass `"Authorization": "Bearer <access_token>"` in the request headers.

### Train APIs
**3. Search Trains**
* **Endpoint:** `GET /api/trains/search/?source=Delhi&destination=Mumbai`
* **Description:** Searches for trains. Every successful search natively triggers a log insert into **MongoDB**.

**4. Create Train (Admin Only)**
* **Endpoint:** `POST /api/trains/`
* **Headers:** `Authorization: Bearer <admin_token>` (or `x-admin-api-key`)
* **Body:** 
```json
{
  "train_number": "12345",
  "name": "Rajdhani Express",
  "source": "Delhi",
  "destination": "Mumbai",
  "total_seats": 100,
  "available_seats": 100,
  "departure_time": "2024-05-10T10:00:00Z",
  "arrival_time": "2024-05-11T10:00:00Z"
}
```

### Booking APIs
**5. Book a Ticket**
* **Endpoint:** `POST /api/bookings/`
* **Body:** `{"train_id": 1, "no_of_seats": 2}`
* **Description:** Safely validates availability, wraps the deduction in an SQL Atomic Transaction, and reserves the seats.

**6. View My Bookings**
* **Endpoint:** `GET /api/bookings/my/`
* **Returns:** A list of the logged-in user's bookings with nested train details.

### Analytics API
**7. Get Top Routes (MongoDB)**
* **Endpoint:** `GET /api/analytics/top-routes/`
* **Description:** Dynamically queries the `search_logs` collection from MongoDB and aggregates the Top 5 most searched source-to-destination pairs.

---

## 📂 Project Structure & Deliverables

* **Source Code:** A fully modularized Django application conforming to REST architectural standards.
* **MySQL Schema:** Modeled using optimized Django ORM classes in `models.py`.
* **MongoDB Usage:** `log_search_to_mongo` correctly executes on `GET /api/trains/search/`. Aggregation Pipeline implemented inside `analytics/views.py`.
* **Sample Logs:** A valid JSON export (`mongo_logs_sample.json`) showcasing the raw MongoDB schema is provided in the root folder.
* **Frontend Application:** A full React/NextJS frontend was created independently to interactively test this API from a GUI. Run `npm install` and `npm run dev` in the `frontend` folder to launch it on port 3000.
