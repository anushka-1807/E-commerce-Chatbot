# System Architecture

## E-commerce Sales Chatbot - Technical Architecture

This document outlines the comprehensive system architecture, design patterns, and technical decisions implemented in the E-commerce Sales Chatbot system.

## 🏗️ Architecture Overview

The system follows a modern **Client-Server Architecture** with clear separation of concerns, implementing RESTful API design principles and responsive frontend patterns.

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (Client)      │◄──►│   (Server)      │◄──►│   (Storage)     │
│                 │    │                 │    │                 │
│ • HTML/CSS/JS   │    │ • Flask API     │    │ • SQLite        │
│ • Responsive UI │    │ • JWT Auth      │    │ • Product Data  │
│ • Chat Interface│    │ • NLP Engine    │    │ • User Sessions │
│ • State Mgmt    │    │ • Product Search│    │ • Chat History  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🎯 Design Principles

### 1. **Separation of Concerns**
- **Frontend**: User interface, interaction handling, state management
- **Backend**: Business logic, data processing, API endpoints
- **Database**: Data persistence, relationships, integrity

### 2. **Modular Architecture**
- Each component has a single responsibility
- Loose coupling between modules
- High cohesion within modules
- Easy to test and maintain

### 3. **Scalability**
- Stateless API design
- JWT-based authentication
- Database abstraction layer
- Configurable components

### 4. **Security First**
- Input validation and sanitization
- JWT token-based authentication
- Password hashing with bcrypt
- CORS configuration
- SQL injection prevention

## 🗄️ Database Architecture

### Entity Relationship Diagram

```
┌─────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    Users    │────►│  ChatSessions   │────►│  ChatMessages   │
├─────────────┤     ├─────────────────┤     ├─────────────────┤
│ • id (PK)   │     │ • id (PK)       │     │ • id (PK)       │
│ • username  │     │ • user_id (FK)  │     │ • session_id(FK)│
│ • email     │     │ • session_token │     │ • message_type  │
│ • password  │     │ • created_at    │     │ • content       │
│ • created_at│     │ • updated_at    │     │ • timestamp     │
│ • is_active │     │ • is_active     │     │ • metadata      │
└─────────────┘     └─────────────────┘     └─────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      Products                               │
├─────────────────────────────────────────────────────────────┤
│ • id (PK)              • rating           • is_on_sale      │
│ • name                 • is_featured      • sale_price      │
│ • description          • stock_quantity   • created_at      │
│ • price                • image_url                          │
│ • category             • brand                              │
└─────────────────────────────────────────────────────────────┘
```

### Database Design Patterns

1. **Normalized Structure**: Reduces data redundancy
2. **Foreign Key Relationships**: Ensures data integrity
3. **Indexing Strategy**: Optimizes query performance
4. **Soft Deletes**: Maintains data history (is_active flags)

## 🚀 Backend Architecture

### Component Structure

```
backend/
├── app.py              # Flask application entry point
├── models.py           # SQLAlchemy database models
├── auth.py             # JWT authentication manager
├── chatbot.py          # NLP engine and conversation logic
├── requirements.txt    # Python dependencies
└── database/
    └── init_db.py      # Database initialization script
```

### Layer Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  Presentation Layer                      │
│  Flask Routes • Request/Response Handling • CORS        │
├─────────────────────────────────────────────────────────┤
│                  Business Logic Layer                   │
│  Authentication • Chatbot Engine • Product Search       │
├─────────────────────────────────────────────────────────┤
│                  Data Access Layer                      │
│  SQLAlchemy ORM • Database Models • Query Optimization  │
├─────────────────────────────────────────────────────────┤
│                  Database Layer                         │
│  SQLite • Data Storage • Transactions • Constraints     │
└─────────────────────────────────────────────────────────┘
```

### API Design Patterns

1. **RESTful Architecture**
   - Resource-based URLs
   - HTTP verbs for operations
   - Stateless communication
   - JSON data format

2. **Authentication Flow**
   ```
   Client ─┐
           ├─► POST /auth/login ─► JWT Token
           └─► Headers: Authorization: Bearer <token>
   ```

3. **Error Handling**
   - Consistent error response format
   - HTTP status codes
   - Detailed error messages
   - Graceful degradation

### Chatbot NLP Engine

```
┌─────────────────────────────────────────────────────────┐
│                 Chatbot Processing Flow                 │
├─────────────────────────────────────────────────────────┤
│ Input Message                                           │
│      ↓                                                  │
│ Intent Classification (Pattern Matching)               │
│      ↓                                                  │
│ Entity Extraction (Price, Brand, Category)             │
│      ↓                                                  │
│ Query Builder (Database Search)                        │
│      ↓                                                  │
│ Response Generation (Formatted Results)                │
│      ↓                                                  │
│ Session Management (History Storage)                   │
└─────────────────────────────────────────────────────────┘
```

**NLP Capabilities:**
- **Pattern Recognition**: Keyword-based intent classification
- **Entity Extraction**: Price ranges, brands, categories
- **Fuzzy Matching**: Product name similarity search
- **Context Awareness**: Session-based conversation flow

## 🎨 Frontend Architecture

### Component Structure

```
frontend/
├── index.html          # Main HTML structure
├── css/
│   ├── styles.css      # Global styles and utilities
│   └── chatbot.css     # Chat interface specific styles
└── js/
    ├── utils.js        # Utility functions and helpers
    ├── auth.js         # Authentication handling
    ├── main.js         # Application controller
    └── chatbot.js      # Chat functionality
```

### Module Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Application Layer                    │
│  App Controller • Event Coordination • State Management │
├─────────────────────────────────────────────────────────┤
│                    Feature Modules                     │
│  Auth Manager • Chat Manager • UI Components           │
├─────────────────────────────────────────────────────────┤
│                    Utility Layer                       │
│  API Client • Storage Manager • DOM Utils • Formatters │
├─────────────────────────────────────────────────────────┤
│                    Browser APIs                        │
│  Fetch API • Local Storage • DOM • Events              │
└─────────────────────────────────────────────────────────┘
```

### State Management Pattern

```javascript
// Global Application State
const AppState = {
    isAuthenticated: false,
    currentUser: null,
    currentSessionToken: null,
    authToken: null
};

// State Persistence
LocalStorage ↔ AppState ↔ UI Components
```

### Responsive Design Strategy

1. **Mobile-First Approach**
   - Base styles for mobile
   - Progressive enhancement for larger screens
   - Flexible grid systems

2. **Breakpoint Strategy**
   ```css
   /* Mobile: < 768px (base styles) */
   /* Tablet: 768px - 1024px */
   /* Desktop: > 1024px */
   ```

3. **Component Adaptability**
   - Flexible chat interface
   - Collapsible sidebar
   - Touch-friendly interactions

## 🔐 Security Architecture

### Authentication & Authorization

```
┌─────────────────────────────────────────────────────────┐
│                  Security Flow                          │
├─────────────────────────────────────────────────────────┤
│ User Credentials                                        │
│      ↓                                                  │
│ Password Hashing (bcrypt)                              │
│      ↓                                                  │
│ JWT Token Generation                                    │
│      ↓                                                  │
│ Client-side Storage (localStorage)                     │
│      ↓                                                  │
│ Request Authentication (Bearer Token)                  │
│      ↓                                                  │
│ Token Validation & Route Protection                    │
└─────────────────────────────────────────────────────────┘
```

### Security Measures

1. **Password Security**
   - bcrypt hashing with salt
   - Minimum complexity requirements
   - Secure password storage

2. **Token Security**
   - JWT with expiration
   - Stateless authentication
   - Secure token storage

3. **Input Validation**
   - Client-side validation
   - Server-side sanitization
   - SQL injection prevention

4. **CORS Configuration**
   - Controlled cross-origin access
   - Whitelisted domains
   - Secure headers

## 📊 Data Flow Architecture

### Request/Response Flow

```
┌─────────────┐    HTTP/JSON    ┌─────────────┐    SQL    ┌─────────────┐
│   Browser   │◄──────────────►│  Flask API  │◄─────────►│  Database   │
│             │                │             │           │             │
│ • UI Events │                │ • Routing   │           │ • Products  │
│ • State Mgmt│                │ • Business  │           │ • Users     │
│ • Rendering │                │ • Auth      │           │ • Sessions  │
└─────────────┘                └─────────────┘           └─────────────┘
```

### Chat Message Flow

```
User Input ──► Frontend Validation ──► API Request ──► 
Chatbot Processing ──► Database Query ──► Response Generation ──► 
JSON Response ──► Frontend Rendering ──► UI Update
```

## 🚦 Performance Architecture

### Frontend Optimization

1. **Code Organization**
   - Modular JavaScript files
   - CSS optimization
   - Asset minification (production)

2. **Loading Strategies**
   - Progressive loading
   - Lazy loading for images
   - Efficient DOM manipulation

3. **Caching Strategy**
   - localStorage for user data
   - Browser caching headers
   - API response caching

### Backend Optimization

1. **Database Optimization**
   - Indexed queries
   - Optimized table structure
   - Connection pooling

2. **API Performance**
   - Efficient query building
   - Response compression
   - Rate limiting

## 🔧 Deployment Architecture

### Development Environment

```
┌─────────────────────────────────────────────────────────┐
│                Development Setup                        │
├─────────────────────────────────────────────────────────┤
│ Frontend: File Server (localhost:8080)                 │
│ Backend: Flask Dev Server (localhost:5000)             │
│ Database: SQLite (local file)                          │
│ Dependencies: pip (Python) + npm (optional)            │
└─────────────────────────────────────────────────────────┘
```

### Production Deployment Options

1. **Traditional Hosting**
   ```
   Frontend: Apache/Nginx (Static Files)
   Backend: Gunicorn + Flask (WSGI)
   Database: PostgreSQL/MySQL
   ```

2. **Cloud Deployment**
   ```
   Frontend: CDN (CloudFront/CloudFlare)
   Backend: AWS/GCP/Azure (Container/Serverless)
   Database: RDS/Cloud SQL
   ```

3. **Containerized Deployment**
   ```
   Docker Containers:
   ├── Frontend Container (Nginx)
   ├── Backend Container (Flask + Gunicorn)
   └── Database Container (PostgreSQL)
   ```

## 📈 Scalability Considerations

### Horizontal Scaling

1. **Stateless Design**
   - JWT tokens eliminate server-side sessions
   - Each request is independent
   - Easy load balancing

2. **Database Scaling**
   - Read replicas for product data
   - Partitioning strategies
   - Caching layers (Redis)

3. **Microservices Migration**
   ```
   Current: Monolithic Flask App
   Future: 
   ├── Authentication Service
   ├── Product Catalog Service
   ├── Chatbot Engine Service
   └── User Management Service
   ```

### Performance Monitoring

1. **Metrics Collection**
   - Response times
   - Error rates
   - Database query performance
   - User engagement metrics

2. **Logging Strategy**
   - Structured logging
   - Error tracking
   - User behavior analytics

## 🧪 Testing Architecture

### Testing Strategy

1. **Backend Testing**
   ```python
   Unit Tests: Individual function testing
   Integration Tests: API endpoint testing
   Database Tests: Model and query testing
   ```

2. **Frontend Testing**
   ```javascript
   Unit Tests: Utility function testing
   Integration Tests: Component interaction
   E2E Tests: User workflow testing
   ```

3. **API Testing**
   - Postman collections
   - Automated API testing
   - Load testing scenarios

## 🔄 Future Architecture Enhancements

### Planned Improvements

1. **Advanced NLP**
   - Machine learning integration
   - Intent classification models
   - Sentiment analysis

2. **Real-time Features**
   - WebSocket connections
   - Live chat support
   - Real-time notifications

3. **Analytics Platform**
   - User behavior tracking
   - Conversation analytics
   - Business intelligence dashboard

4. **Enhanced Security**
   - OAuth integration
   - Two-factor authentication
   - API rate limiting enhancements

## 📚 Technology Stack Summary

### Backend Technologies
- **Framework**: Flask (Python)
- **Database**: SQLite (dev) / PostgreSQL (prod)
- **ORM**: SQLAlchemy
- **Authentication**: Flask-JWT-Extended
- **NLP**: Custom pattern matching + fuzzywuzzy
- **Security**: bcrypt, CORS

### Frontend Technologies
- **Markup**: HTML5 (Semantic)
- **Styling**: CSS3 (Grid/Flexbox, Custom Properties)
- **Scripting**: Vanilla JavaScript (ES6+)
- **State Management**: Custom global state
- **HTTP Client**: Fetch API

### Development Tools
- **Version Control**: Git
- **Package Management**: pip (Python)
- **Documentation**: Markdown
- **Testing**: Manual + Postman

This architecture provides a solid foundation for a production-ready e-commerce chatbot system with clear separation of concerns, security best practices, and scalability considerations. 