# Luxeory Server
This is the server-side application for the **Luxeory** hotel booking platform. The backend provides API functionalities for room management, bookings, user authentication, and reviews, ensuring seamless integration with the frontend.

---

## Key Features

- **Authentication:**
  - JWT-based authentication for secure login.
  - Token storage in cookies with configurable security options.
- **Room Management:**
  - Retrieve available rooms with sorting functionality.
  - Fetch room details by ID.
- **Booking Management:**
  - Book rooms, update bookings, and delete bookings.
  - Auto-update room availability during booking.
- **Review System:**
  - Add and retrieve reviews for rooms with sorting by timestamps.
  - Automatically update review counts for rooms.
- **Secure API Calls:**
  - Protected routes using middleware to verify JWT tokens.
- **Middleware:**
  - `cors` for cross-origin resource sharing.
  - `cookie-parser` for handling cookies.

---

## Environment Variables

The application requires the following environment variables configured in a `.env` file:

```plaintext
DB_USER=database_user
DB_PASSWORD=database_password
ACCESS_TOKEN_SECRET=jwt_secret_key
PORT=server_port (default is 5000)
NODE_ENV=production (for production) or development
```

---

## API Endpoints

### Authentication APIs
#### 1. **Generate JWT Token**
- **Endpoint:** `POST /jwt`
- **Description:** Generates a JWT token for user authentication.
- **Request Body:** 
  ```json
  {
    "email": "user@example.com",
  }
  ```
- **Response:**
  ```json
  {
    "success": true
  }
  ```

#### 2. **Logout**
- **Endpoint:** `POST /logout`
- **Description:** Clears the JWT token from cookies.
- **Response:**
  ```json
  {
    "success": true
  }
  ```

---

### Room APIs
#### 1. **Get All Rooms**
- **Endpoint:** `GET /rooms`
- **Description:** Retrieves all rooms, sorted by a specific field (default: `reviewCount`).
- **Query Parameters:**
  - `sortBy` (optional): Field to sort by.
- **Response:** Array of room objects.

#### 2. **Get Room by ID**
- **Endpoint:** `GET /rooms/:id`
- **Description:** Fetch details of a room by its ID.
- **Response:** Room object.

---

### Booking APIs
#### 1. **Create Booking**
- **Endpoint:** `POST /bookings`
- **Description:** Create a new booking and update room availability.
- **Request Body:**
  ```json
  {
    "roomId": "room_id",
    "email": "user@example.com",
    "bookingDate": "2024-01-01"
  }
  ```
- **Response:** Booking confirmation.

#### 2. **Get User Bookings**
- **Endpoint:** `GET /bookings/:email`
- **Middleware:** `verifyToken`
- **Description:** Retrieve all bookings for a specific user.
- **Response:** Array of bookings with room details.

#### 3. **Update Booking Date**
- **Endpoint:** `PATCH /bookings/:id`
- **Description:** Update the booking date for a specific booking.
- **Request Body:**
  ```json
  {
    "newDate": "2024-02-01",
    "roomId": "room_id"
  }
  ```
- **Response:** Update confirmation.

#### 4. **Cancel Booking**
- **Endpoint:** `DELETE /bookings/:id`
- **Description:** Cancel a booking and update room availability.
- **Query Parameters:**
  - `roomId`: ID of the room.
- **Response:** Cancellation confirmation.

---

### Review APIs
#### 1. **Add Review**
- **Endpoint:** `POST /reviews`
- **Description:** Add a new review and increment the room's review count.
- **Request Body:**
  ```json
  {
    "roomId": "room_id",
    "reviewText": "Great room!",
    "rating": 5,
    "timestamp": 1672531200
  }
  ```
- **Response:** Review confirmation.

#### 2. **Get Reviews**
- **Endpoint:** `GET /reviews`
- **Description:** Retrieve reviews for a specific room or all reviews.
- **Query Parameters:**
  - `roomId` (optional): ID of the room to filter reviews.
- **Response:** Array of reviews.

---

## Middleware

### `verifyToken`
- Ensures the user is authenticated by verifying the JWT token.
- Returns a `401 Unauthorized` error if the token is invalid or missing.

---

## Database Collections

### 1. **rooms**
Stores information about hotel rooms, including availability and review counts.

### 2. **bookings**
Tracks room bookings made by users.

### 3. **reviews**
Stores user reviews for specific rooms.

---


## Key Technologies

- **Node.js** and **Express.js** for the backend framework.
- **MongoDB** for the database.
- **JWT** for authentication.
- **dotenv** for environment variable management.
- **cookie-parser** and **cors** for middleware.

---