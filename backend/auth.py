"""
Authentication utilities for JWT token handling and user management.
"""

from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from datetime import timedelta
import secrets
from models import User, db_manager
import os

class AuthManager:
    """Handles authentication and user management."""
    
    def __init__(self, app=None):
        self.jwt = None
        if app:
            self.init_app(app)
    
    def init_app(self, app):
        """Initialize JWT manager with Flask app."""
        # Use a consistent secret key for development
        # In production, this should be set from environment variables
        app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'dev-jwt-secret-key-for-ecommerce-chatbot-2024')
        app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)
        self.jwt = JWTManager(app)
        
    def register_user(self, username, email, password):
        """Register a new user."""
        session = db_manager.get_session()
        try:
            # Check if user already exists
            existing_user = session.query(User).filter(
                (User.username == username) | (User.email == email)
            ).first()
            
            if existing_user:
                if existing_user.username == username:
                    return {'error': 'Username already exists'}, 400
                else:
                    return {'error': 'Email already exists'}, 400
            
            # Create new user
            user = User(username=username, email=email)
            user.set_password(password)
            
            session.add(user)
            session.commit()
            
            # Ensure user ID is available after commit
            session.refresh(user)
            
            # Create access token with string identity
            print(f"🔧 Creating JWT token for user ID: {user.id} (type: {type(user.id)})")
            access_token = create_access_token(identity=str(user.id))
            print(f"✅ JWT token created successfully")
            
            return {
                'message': 'User registered successfully',
                'access_token': access_token,
                'user': user.to_dict()
            }, 201
            
        except Exception as e:
            session.rollback()
            print(f"❌ Registration error: {str(e)}")
            return {'error': f'Registration failed: {str(e)}'}, 500
        finally:
            db_manager.close_session(session)
    
    def login_user(self, username, password):
        """Authenticate user login."""
        session = db_manager.get_session()
        try:
            # Find user by username or email
            user = session.query(User).filter(
                (User.username == username) | (User.email == username)
            ).first()
            
            if not user or not user.check_password(password):
                return {'error': 'Invalid credentials'}, 401
            
            if not user.is_active:
                return {'error': 'Account is disabled'}, 401
            
            # Create access token with string identity
            print(f"🔧 Creating JWT token for user ID: {user.id} (type: {type(user.id)})")
            access_token = create_access_token(identity=str(user.id))
            print(f"✅ JWT token created successfully")
            
            return {
                'message': 'Login successful',
                'access_token': access_token,
                'user': user.to_dict()
            }, 200
            
        except Exception as e:
            print(f"❌ Login error: {str(e)}")
            return {'error': f'Login failed: {str(e)}'}, 500
        finally:
            db_manager.close_session(session)
    
    def get_current_user(self):
        """Get current authenticated user."""
        user_id_str = get_jwt_identity()
        print(f"🔍 JWT identity retrieved: {user_id_str} (type: {type(user_id_str)})")
        
        try:
            user_id = int(user_id_str)
        except (ValueError, TypeError):
            print(f"❌ Invalid user ID format: {user_id_str}")
            return None
            
        session = db_manager.get_session()
        try:
            user = session.query(User).filter(User.id == user_id).first()
            if user:
                print(f"✅ User found: {user.username}")
            else:
                print(f"❌ User not found with ID: {user_id}")
            return user.to_dict() if user else None
        finally:
            db_manager.close_session(session)
    
    def validate_user_data(self, username, email, password):
        """Validate user registration data."""
        errors = []
        
        # Username validation
        if not username or len(username) < 3:
            errors.append('Username must be at least 3 characters long')
        if len(username) > 80:
            errors.append('Username must be less than 80 characters')
        
        # Email validation
        if not email or '@' not in email:
            errors.append('Valid email address is required')
        if len(email) > 120:
            errors.append('Email must be less than 120 characters')
        
        # Password validation
        if not password or len(password) < 6:
            errors.append('Password must be at least 6 characters long')
        if len(password) > 128:
            errors.append('Password must be less than 128 characters')
        
        return errors

# Global auth manager instance
auth_manager = AuthManager() 