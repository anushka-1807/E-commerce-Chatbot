"""
Database models for the E-commerce Chatbot system.
"""

from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text, Boolean, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import bcrypt

Base = declarative_base()

class User(Base):
    """User model for authentication and session management."""
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True)
    username = Column(String(80), unique=True, nullable=False)
    email = Column(String(120), unique=True, nullable=False)
    password_hash = Column(String(128), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    
    # Relationship to chat sessions
    chat_sessions = relationship("ChatSession", back_populates="user")
    
    def set_password(self, password):
        """Hash and set the user's password."""
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    def check_password(self, password):
        """Check if the provided password matches the stored hash."""
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))
    
    def to_dict(self):
        """Convert user object to dictionary."""
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'is_active': self.is_active
        }

class Product(Base):
    """Product model for e-commerce inventory."""
    __tablename__ = 'products'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(200), nullable=False)
    description = Column(Text)
    price = Column(Float, nullable=False)
    category = Column(String(100), nullable=False)
    brand = Column(String(100))
    stock_quantity = Column(Integer, default=0)
    image_url = Column(String(500))
    rating = Column(Float, default=0.0)
    is_featured = Column(Boolean, default=False)
    is_on_sale = Column(Boolean, default=False)
    sale_price = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    def get_display_price(self):
        """Get the price to display (sale price if on sale, otherwise regular price)."""
        return self.sale_price if self.is_on_sale and self.sale_price else self.price
    
    def to_dict(self):
        """Convert product object to dictionary."""
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'price': self.price,
            'category': self.category,
            'brand': self.brand,
            'stock_quantity': self.stock_quantity,
            'image_url': self.image_url,
            'rating': self.rating,
            'is_featured': self.is_featured,
            'is_on_sale': self.is_on_sale,
            'sale_price': self.sale_price,
            'display_price': self.get_display_price(),
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class ChatSession(Base):
    """Chat session model to store conversation history."""
    __tablename__ = 'chat_sessions'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    session_token = Column(String(255), unique=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    user = relationship("User", back_populates="chat_sessions")
    messages = relationship("ChatMessage", back_populates="session")
    
    def to_dict(self):
        """Convert chat session object to dictionary."""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'session_token': self.session_token,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'is_active': self.is_active,
            'message_count': len(self.messages) if self.messages else 0
        }

class ChatMessage(Base):
    """Individual chat messages within a session."""
    __tablename__ = 'chat_messages'
    
    id = Column(Integer, primary_key=True)
    session_id = Column(Integer, ForeignKey('chat_sessions.id'), nullable=False)
    message_type = Column(String(20), nullable=False)  # 'user' or 'bot'
    content = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    message_metadata = Column(Text)  # JSON string for additional data (renamed from metadata)
    
    # Relationship
    session = relationship("ChatSession", back_populates="messages")
    
    def to_dict(self):
        """Convert chat message object to dictionary."""
        return {
            'id': self.id,
            'session_id': self.session_id,
            'message_type': self.message_type,
            'content': self.content,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None,
            'metadata': self.message_metadata
        }

class DatabaseManager:
    """Database management utility class."""
    
    def __init__(self, database_url='sqlite:///ecommerce_chatbot.db'):
        self.engine = create_engine(database_url, echo=False)
        self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)
        Base.metadata.create_all(bind=self.engine)
    
    def get_session(self):
        """Get a database session."""
        return self.SessionLocal()
    
    def close_session(self, session):
        """Close a database session."""
        session.close()
    
    def create_tables(self):
        """Create all database tables."""
        Base.metadata.create_all(bind=self.engine)
    
    def drop_tables(self):
        """Drop all database tables."""
        Base.metadata.drop_all(bind=self.engine)

# Global database manager instance
db_manager = DatabaseManager() 