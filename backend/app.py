"""
Main Flask application for the E-commerce Chatbot backend.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
import os

# Import our modules
from models import db_manager, Product, User
from auth import auth_manager
from chatbot import chatbot

def create_app():
    """Create and configure Flask application."""
    app = Flask(__name__)
    
    # Configuration
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Enable CORS for frontend communication
    CORS(app, origins=['http://localhost:8080', 'http://127.0.0.1:8080', 'file://'])
    
    # Initialize authentication
    auth_manager.init_app(app)
    
    return app

app = create_app()

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'version': '1.0.0'
    })

# Authentication endpoints
@app.route('/api/auth/register', methods=['POST'])
def register():
    """User registration endpoint."""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        username = data.get('username', '').strip()
        email = data.get('email', '').strip()
        password = data.get('password', '')
        
        # Validate input data
        validation_errors = auth_manager.validate_user_data(username, email, password)
        if validation_errors:
            return jsonify({'error': validation_errors}), 400
        
        # Register user
        result, status_code = auth_manager.register_user(username, email, password)
        return jsonify(result), status_code
        
    except Exception as e:
        return jsonify({'error': f'Registration failed: {str(e)}'}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    """User login endpoint."""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        username = data.get('username', '').strip()
        password = data.get('password', '')
        
        if not username or not password:
            return jsonify({'error': 'Username and password are required'}), 400
        
        # Authenticate user
        result, status_code = auth_manager.login_user(username, password)
        return jsonify(result), status_code
        
    except Exception as e:
        return jsonify({'error': f'Login failed: {str(e)}'}), 500

@app.route('/api/auth/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Get current user information."""
    try:
        user = auth_manager.get_current_user()
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({
            'user': user,
            'message': 'User information retrieved successfully'
        })
        
    except Exception as e:
        return jsonify({'error': f'Failed to get user info: {str(e)}'}), 500

# Product endpoints
@app.route('/api/products', methods=['GET'])
def get_products():
    """Get all products with optional filtering."""
    try:
        session = db_manager.get_session()
        
        # Get query parameters
        category = request.args.get('category')
        brand = request.args.get('brand')
        min_price = request.args.get('min_price', type=float)
        max_price = request.args.get('max_price', type=float)
        featured = request.args.get('featured', type=bool)
        on_sale = request.args.get('on_sale', type=bool)
        limit = request.args.get('limit', default=50, type=int)
        offset = request.args.get('offset', default=0, type=int)
        
        # Build query
        query = session.query(Product)
        
        # Apply filters
        if category:
            query = query.filter(Product.category.ilike(f'%{category}%'))
        
        if brand:
            query = query.filter(Product.brand.ilike(f'%{brand}%'))
        
        if min_price is not None:
            query = query.filter(Product.price >= min_price)
        
        if max_price is not None:
            query = query.filter(Product.price <= max_price)
        
        if featured is not None:
            query = query.filter(Product.is_featured == featured)
        
        if on_sale is not None:
            query = query.filter(Product.is_on_sale == on_sale)
        
        # Get total count
        total_count = query.count()
        
        # Apply pagination
        products = query.offset(offset).limit(limit).all()
        
        # Convert to dict
        products_data = [product.to_dict() for product in products]
        
        return jsonify({
            'products': products_data,
            'total_count': total_count,
            'limit': limit,
            'offset': offset,
            'has_more': offset + len(products_data) < total_count
        })
        
    except Exception as e:
        return jsonify({'error': f'Failed to get products: {str(e)}'}), 500
    finally:
        db_manager.close_session(session)

@app.route('/api/products/search', methods=['GET'])
def search_products():
    """Search products by keyword."""
    try:
        query_text = request.args.get('q', '').strip()
        limit = request.args.get('limit', default=20, type=int)
        
        if not query_text:
            return jsonify({'error': 'Search query is required'}), 400
        
        session = db_manager.get_session()
        
        # Search in name and description
        from sqlalchemy import or_
        
        products = session.query(Product).filter(
            or_(
                Product.name.ilike(f'%{query_text}%'),
                Product.description.ilike(f'%{query_text}%'),
                Product.brand.ilike(f'%{query_text}%'),
                Product.category.ilike(f'%{query_text}%')
            )
        ).limit(limit).all()
        
        products_data = [product.to_dict() for product in products]
        
        return jsonify({
            'products': products_data,
            'query': query_text,
            'total_results': len(products_data)
        })
        
    except Exception as e:
        return jsonify({'error': f'Search failed: {str(e)}'}), 500
    finally:
        db_manager.close_session(session)

@app.route('/api/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    """Get single product by ID."""
    try:
        session = db_manager.get_session()
        
        product = session.query(Product).filter(Product.id == product_id).first()
        
        if not product:
            return jsonify({'error': 'Product not found'}), 404
        
        return jsonify({
            'product': product.to_dict()
        })
        
    except Exception as e:
        return jsonify({'error': f'Failed to get product: {str(e)}'}), 500
    finally:
        db_manager.close_session(session)

@app.route('/api/products/categories', methods=['GET'])
def get_categories():
    """Get all available product categories."""
    try:
        session = db_manager.get_session()
        
        # Get distinct categories
        categories = session.query(Product.category).distinct().all()
        category_list = [category[0] for category in categories if category[0]]
        
        return jsonify({
            'categories': sorted(category_list)
        })
        
    except Exception as e:
        return jsonify({'error': f'Failed to get categories: {str(e)}'}), 500
    finally:
        db_manager.close_session(session)

@app.route('/api/products/brands', methods=['GET'])
def get_brands():
    """Get all available product brands."""
    try:
        session = db_manager.get_session()
        
        # Get distinct brands
        brands = session.query(Product.brand).distinct().all()
        brand_list = [brand[0] for brand in brands if brand[0]]
        
        return jsonify({
            'brands': sorted(brand_list)
        })
        
    except Exception as e:
        return jsonify({'error': f'Failed to get brands: {str(e)}'}), 500
    finally:
        db_manager.close_session(session)

# Chatbot endpoints
@app.route('/api/chat', methods=['POST'])
@jwt_required()
def chat():
    """Process chat message and return bot response."""
    try:
        # Debug JWT identity
        user_id_str = get_jwt_identity()
        print(f"🔍 Chat endpoint - JWT identity: {user_id_str} (type: {type(user_id_str)})")
        
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        message = data.get('message', '').strip()
        session_token = data.get('session_token')
        
        if not message:
            return jsonify({'error': 'Message is required'}), 400
        
        try:
            user_id = int(user_id_str)
        except (ValueError, TypeError):
            print(f"❌ Invalid user ID format in chat: {user_id_str}")
            return jsonify({'error': 'Invalid user authentication'}), 401
        
        print(f"✅ Chat request from user ID: {user_id}")
        
        # Process message with chatbot
        result = chatbot.process_message(user_id, message, session_token)
        
        return jsonify({
            'response': result['response'],
            'session_token': result['session_token'],
            'session_id': result.get('session_id'),
            'timestamp': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        print(f"❌ Chat processing error: {str(e)}")
        return jsonify({'error': f'Chat processing failed: {str(e)}'}), 500

@app.route('/api/chat/history', methods=['GET'])
@jwt_required()
def get_chat_history():
    """Get chat history for current user."""
    try:
        user_id_str = get_jwt_identity()
        print(f"🔍 Chat history endpoint - JWT identity: {user_id_str} (type: {type(user_id_str)})")
        
        try:
            user_id = int(user_id_str)
        except (ValueError, TypeError):
            print(f"❌ Invalid user ID format in chat history: {user_id_str}")
            return jsonify({'error': 'Invalid user authentication'}), 401
        
        session_token = request.args.get('session_token')
        limit = request.args.get('limit', default=50, type=int)
        
        # Get chat history
        messages = chatbot.get_chat_history(user_id, session_token, limit)
        
        return jsonify({
            'messages': messages,
            'session_token': session_token,
            'total_messages': len(messages)
        })
        
    except Exception as e:
        print(f"❌ Chat history error: {str(e)}")
        return jsonify({'error': f'Failed to get chat history: {str(e)}'}), 500

@app.route('/api/chat/sessions', methods=['GET'])
@jwt_required()
def get_chat_sessions():
    """Get all chat sessions for current user."""
    try:
        user_id_str = get_jwt_identity()
        print(f"🔍 Chat sessions endpoint - JWT identity: {user_id_str} (type: {type(user_id_str)})")
        
        try:
            user_id = int(user_id_str)
        except (ValueError, TypeError):
            print(f"❌ Invalid user ID format in chat sessions: {user_id_str}")
            return jsonify({'error': 'Invalid user authentication'}), 401
        
        # Get user sessions
        sessions = chatbot.get_user_sessions(user_id)
        
        return jsonify({
            'sessions': sessions,
            'total_sessions': len(sessions)
        })
        
    except Exception as e:
        print(f"❌ Chat sessions error: {str(e)}")
        return jsonify({'error': f'Failed to get chat sessions: {str(e)}'}), 500

@app.route('/api/chat/reset', methods=['POST'])
@jwt_required()
def reset_chat():
    """Create a new chat session."""
    try:
        user_id_str = get_jwt_identity()
        print(f"🔍 Chat reset endpoint - JWT identity: {user_id_str} (type: {type(user_id_str)})")
        
        try:
            user_id = int(user_id_str)
        except (ValueError, TypeError):
            print(f"❌ Invalid user ID format in chat reset: {user_id_str}")
            return jsonify({'error': 'Invalid user authentication'}), 401
        
        # Generate new session token
        session_token = chatbot._create_session_token()
        
        return jsonify({
            'session_token': session_token,
            'message': 'New chat session created'
        })
        
    except Exception as e:
        print(f"❌ Chat reset error: {str(e)}")
        return jsonify({'error': f'Failed to reset chat: {str(e)}'}), 500

# Error handlers
@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors."""
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(405)
def method_not_allowed(error):
    """Handle 405 errors."""
    return jsonify({'error': 'Method not allowed'}), 405

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors."""
    return jsonify({'error': 'Internal server error'}), 500

@app.errorhandler(422)
def handle_unprocessable_entity(e):
    """Handle JWT errors."""
    return jsonify({'error': 'Invalid token'}), 422

if __name__ == '__main__':
    print("🚀 Starting E-commerce Chatbot Backend...")
    print("📍 Server running at: http://localhost:5000")
    print("📚 API Documentation: /api/health")
    print("🔧 Initialize database with: python database/init_db.py")
    
    app.run(debug=True, host='0.0.0.0', port=5000) 