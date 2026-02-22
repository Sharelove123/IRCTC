# IRCTC Backend Clone

This is a simplified backend clone of the IRCTC platform, fulfilling the requirements for the Backend Intern Assignment.

## 🚀 Tech Stack
* **Backend Framework:** Django / Django REST Framework (DRF)
* **Primary Database (SQLite):** Used natively by Django for transactional data including Users, Trains, and Bookings.
* **Analytics Database (MongoDB):** Used via `pymongo` (MongoDB Atlas) to log search requests and aggregate top routes.
* **Authentication:** JWT-based (using `djangorestframework-simplejwt`)

## 🛠️ Setup Instructions

### 1. Prerequisites
- Python 3.10+
- MongoDB running locally or via Atlas.
  > **Note for Atlas users:** If you encounter an `[SSL: TLSV1_ALERT_INTERNAL_ERROR]` during API calls (e.g., getting a 500 error on the Analytics page), it means your current IP address is not whitelisted in MongoDB Atlas. Go to your Atlas dashboard -> **Network Access** -> **Add IP Address** -> **Add Current IP Address** to fix this.

### 2. Available Environment Variables
*(See Step 1 below on how to configure these)*

**Step 1: Clone the Repository & Configure Environment**
```bash
# 1. Clone the project
git clone https://github.com/Sharelove123/IRCTC.git
cd IRCTC/backend

# 2. Configure Environment Variables
# Copy the provided template:
cp .env.example .env
# Open .env and adjust the MONGO_URI string to point to your cluster.
```

**Step 2: Start Backend Server**
```bash
# 1. Create a virtual environment
python -m venv venv

# 2. Activate the virtual environment:
# ---> On Windows (PowerShell/CMD):
.\venv\Scripts\activate
# ---> On Mac/Linux:
# source venv/bin/activate


# 3. Install Django dependencies
pip install -r requirements.txt

# 4. Apply SQLite migrations
python manage.py migrate

# 5. Optional: Seed the database with a dummy superuser & trains
python create_initial_data.py

> **Note:** This command automatically generates a superadmin account so you can log in immediately.
> * **Username:** `abcd`
> * **Password:** `abcd`

# 6. Start the Django server (Port 8000)
python manage.py runserver
```

**Step 3: Start the Frontend Application (Next.js)**
Open a *new* terminal window:
```bash
cd IRCTC/frontend

# 1. Install Node.js dependencies
npm install --legacy-peer-deps

# 2. Run the development UI server (Port 3000)
npm run dev
```
You can now visit `http://localhost:3000` in your web browser to interact seamlessly with the Full-Stack Train Booking Simulator!

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
* **SQLite Schema:** Modeled using optimized Django ORM classes in `models.py`.
* **MongoDB Usage:** `log_search_to_mongo` correctly executes on `GET /api/trains/search/`. Aggregation Pipeline implemented inside `analytics/views.py`.
* **Sample Logs:** A valid JSON export (`mongo_logs_sample.json`) showcasing the raw MongoDB schema is provided in the root folder.
* **Frontend Application:** A full React/NextJS front-end was created independently to interactively test this API from a cleanly designed GUI (setup instructions are in the `Installation` section above).
