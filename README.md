# E-commerce Sales Chatbot

A comprehensive e-commerce sales chatbot system built with Python Flask backend and vanilla HTML/CSS/JavaScript frontend.

## 🚀 Features

- **Intelligent Chatbot Interface**: Interactive chat interface with natural language processing
- **Product Search & Filtering**: Advanced search capabilities with multiple filters
- **User Authentication**: Secure login/registration with JWT tokens
- **Session Management**: Persistent chat sessions with timestamps
- **Responsive Design**: Compatible with desktop, tablet, and mobile devices
- **RESTful API**: Complete backend API for product management
- **Mock Database**: 100+ sample electronics products

## 🛠️ Technology Stack

### Backend
- **Python Flask**: Web framework for API development
- **SQLite**: Lightweight database for product storage
- **JWT**: JSON Web Tokens for authentication
- **Flask-CORS**: Cross-origin resource sharing

### Frontend
- **HTML5**: Semantic markup
- **CSS3**: Modern styling with Flexbox/Grid
- **Vanilla JavaScript**: Interactive functionality
- **Fetch API**: HTTP requests to backend

## 📁 Project Structure

```
ecommerce-chatbot/
├── backend/
│   ├── app.py                 # Main Flask application
│   ├── models.py              # Database models
│   ├── auth.py                # Authentication utilities
│   ├── chatbot.py             # Chatbot logic
│   ├── requirements.txt       # Python dependencies
│   └── database/
│       └── init_db.py         # Database initialization
├── frontend/
│   ├── index.html             # Main HTML file
│   ├── css/
│   │   ├── styles.css         # Main stylesheet
│   │   └── chatbot.css        # Chatbot-specific styles
│   └── js/
│       ├── main.js            # Main JavaScript logic
│       ├── auth.js            # Authentication handling
│       ├── chatbot.js         # Chatbot functionality
│       └── utils.js           # Utility functions
└── docs/
    ├── API_DOCUMENTATION.md   # API endpoints documentation
    ├── ARCHITECTURE.md        # System architecture
    └── USER_GUIDE.md          # User guide
```

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Web browser (Chrome, Firefox, Safari, Edge)

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ecommerce-chatbot
   ```

2. **Create virtual environment**
   ```bash
   cd backend
   python -m venv venv
   
   # Windows
   venv\Scripts\activate
   
   # Linux/Mac
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Initialize database**
   ```bash
   python database/init_db.py
   ```

5. **Run the Flask server**
   ```bash
   python app.py
   ```

   The backend will be available at `http://localhost:5000`

### Frontend Setup

1. **Open the frontend**
   - Navigate to the `frontend` directory
   - Open `index.html` in your web browser
   - Or serve it using a local server:
   ```bash
   # Using Python
   cd frontend
   python -m http.server 8080
   
   # Using Node.js (if available)
   npx serve .
   ```

2. **Access the application**
   - Open `http://localhost:8080` in your browser
   - Register a new account or use demo credentials

## 📝 Usage

1. **Registration/Login**: Create an account or log in
2. **Chat Interface**: Start chatting with the bot
3. **Product Search**: Ask about products using natural language
4. **Filtering**: Use filters for category, price range, brand
5. **Product Details**: View detailed product information
6. **Session History**: View previous chat sessions

## 🔧 API Endpoints

- `POST /api/auth/register`: User registration
- `POST /api/auth/login`: User login
- `GET /api/products`: Get all products
- `GET /api/products/search`: Search products
- `POST /api/chat`: Send chat message
- `GET /api/chat/history`: Get chat history

## 🧪 Sample Queries

- "Show me smartphones under $500"
- "I need a laptop for gaming"
- "What headphones do you recommend?"
- "Filter by Samsung brand"
- "Show electronics on sale"

## 🏗️ Architecture

The system follows a modern client-server architecture:

- **Frontend**: Responsive SPA using vanilla JavaScript
- **Backend**: RESTful API built with Flask
- **Database**: SQLite for development, easily scalable to PostgreSQL
- **Authentication**: JWT tokens for stateless authentication
- **Communication**: Fetch API for HTTP requests

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token expiration
- Input validation and sanitization
- CORS configuration
- SQL injection prevention

## 🚧 Challenges & Solutions

### Challenge 1: Natural Language Processing
**Solution**: Implemented keyword-based search with fuzzy matching

### Challenge 2: Session Management
**Solution**: Used JWT tokens with localStorage for client-side storage

### Challenge 3: Responsive Design
**Solution**: CSS Grid and Flexbox with media queries

## 🔄 Future Enhancements

- Machine learning for better product recommendations
- Integration with payment gateways
- Real-time notifications
- Advanced NLP with transformers
- Shopping cart functionality

## 📚 Documentation

- [API Documentation](docs/API_DOCUMENTATION.md)
- [System Architecture](docs/ARCHITECTURE.md)
- [User Guide](docs/USER_GUIDE.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

Developed as part of an E-commerce Chatbot case study demonstrating full-stack development skills. #
