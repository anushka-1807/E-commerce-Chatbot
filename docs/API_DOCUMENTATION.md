# API Documentation

## E-commerce Chatbot API

This document provides detailed information about the RESTful API endpoints available in the E-commerce Sales Chatbot system.

### Base URL
```
http://localhost:5000/api
```

### Authentication
The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

---

## Authentication Endpoints

### Register User
**POST** `/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "username": "string",
  "email": "string", 
  "password": "string"
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "user_id": "integer"
}
```

**Status Codes:**
- `201`: User created successfully
- `400`: Invalid input data
- `409`: User already exists

---

### Login User
**POST** `/auth/login`

Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "access_token": "jwt_token_string",
  "user": {
    "id": "integer",
    "username": "string",
    "email": "string"
  }
}
```

**Status Codes:**
- `200`: Login successful
- `401`: Invalid credentials

---

## Product Endpoints

### Get All Products
**GET** `/products`

Retrieve all products with optional pagination.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `per_page` (optional): Items per page (default: 20)

**Response:**
```json
{
  "products": [
    {
      "id": "integer",
      "name": "string",
      "description": "string",
      "price": "float",
      "category": "string",
      "brand": "string",
      "rating": "float",
      "stock_quantity": "integer",
      "image_url": "string",
      "on_sale": "boolean",
      "sale_price": "float"
    }
  ],
  "total": "integer",
  "pages": "integer",
  "current_page": "integer"
}
```

---

### Search Products
**GET** `/products/search`

Search products with filters and query parameters.

**Query Parameters:**
- `q`: Search query string
- `category`: Filter by category
- `brand`: Filter by brand
- `min_price`: Minimum price filter
- `max_price`: Maximum price filter
- `on_sale`: Filter sale items (true/false)
- `sort_by`: Sort field (price, rating, name)
- `sort_order`: Sort direction (asc, desc)

**Response:**
```json
{
  "products": [
    {
      "id": "integer",
      "name": "string",
      "description": "string",
      "price": "float",
      "category": "string",
      "brand": "string",
      "rating": "float",
      "stock_quantity": "integer",
      "relevance_score": "float"
    }
  ],
  "total_results": "integer",
  "query": "string",
  "filters_applied": "object"
}
```

---

### Get Product by ID
**GET** `/products/{product_id}`

Retrieve detailed information for a specific product.

**Path Parameters:**
- `product_id`: Product identifier

**Response:**
```json
{
  "id": "integer",
  "name": "string",
  "description": "string",
  "price": "float",
  "category": "string",
  "brand": "string",
  "rating": "float",
  "stock_quantity": "integer",
  "image_url": "string",
  "on_sale": "boolean",
  "sale_price": "float",
  "specifications": "object"
}
```

---

## Chat Endpoints

### Send Chat Message
**POST** `/chat` 🔒

Send a message to the chatbot and receive a response.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "message": "string",
  "session_id": "string (optional)"
}
```

**Response:**
```json
{
  "response": "string",
  "session_id": "string",
  "timestamp": "datetime",
  "products": [
    {
      "id": "integer",
      "name": "string",
      "price": "float",
      "image_url": "string",
      "rating": "float"
    }
  ],
  "suggested_actions": ["string"]
}
```

---

### Get Chat History
**GET** `/chat/history` 🔒

Retrieve chat history for the authenticated user.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `session_id` (optional): Specific session ID
- `limit` (optional): Number of messages to retrieve

**Response:**
```json
{
  "sessions": [
    {
      "session_id": "string",
      "created_at": "datetime",
      "last_message": "datetime",
      "messages": [
        {
          "id": "integer",
          "message": "string",
          "response": "string",
          "timestamp": "datetime",
          "is_user": "boolean"
        }
      ]
    }
  ]
}
```

---

### Get Chat Sessions
**GET** `/chat/sessions` 🔒

Retrieve all chat sessions for the authenticated user.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "sessions": [
    {
      "id": "string",
      "title": "string",
      "created_at": "datetime",
      "last_activity": "datetime",
      "message_count": "integer"
    }
  ]
}
```

---

## Utility Endpoints

### Health Check
**GET** `/health`

Check API health status.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "datetime",
  "version": "1.0.0"
}
```

---

### Get Categories
**GET** `/categories`

Retrieve all available product categories.

**Response:**
```json
{
  "categories": [
    {
      "name": "string",
      "count": "integer"
    }
  ]
}
```

---

### Get Brands
**GET** `/brands`

Retrieve all available product brands.

**Response:**
```json
{
  "brands": [
    {
      "name": "string",
      "count": "integer"
    }
  ]
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Bad Request",
  "message": "Detailed error description",
  "code": 400
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized", 
  "message": "Invalid or missing authentication token",
  "code": 401
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "Resource not found",
  "code": 404
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred",
  "code": 500
}
```

---

## Rate Limiting

- **Authentication endpoints**: 5 requests per minute per IP
- **Search endpoints**: 100 requests per minute per user
- **Chat endpoints**: 50 requests per minute per user

---

## Sample Requests

### Using cURL

**Register a new user:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "securepassword123"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "password": "securepassword123"
  }'
```

**Search products:**
```bash
curl -X GET "http://localhost:5000/api/products/search?q=smartphone&max_price=500" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Send chat message:**
```bash
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "message": "Show me the best smartphones under $600"
  }'
```

---

## WebSocket Support (Future Enhancement)

Real-time chat functionality can be implemented using WebSocket connections:

```javascript
const socket = new WebSocket('ws://localhost:5000/ws/chat');
socket.onmessage = function(event) {
  const data = JSON.parse(event.data);
  // Handle real-time chat message
};
```

---

## Testing

Use tools like Postman, Insomnia, or cURL to test the API endpoints. A Postman collection is available in the repository for easy testing.

## Versioning

Current API version: `v1`
All endpoints are prefixed with `/api/v1/` for future version compatibility.

For questions or issues with the API, please refer to the main README or create an issue in the repository. 