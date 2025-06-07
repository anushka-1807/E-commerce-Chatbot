#!/usr/bin/env python3
"""
Simple database test script
"""

import sys
import os

# Add the backend directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    print("Testing database connection...")
    
    # Test SQLAlchemy import
    from sqlalchemy import create_engine
    print("✅ SQLAlchemy imported successfully")
    
    # Test our models
    from models import Base, User, Product, ChatSession, ChatMessage, db_manager
    print("✅ Models imported successfully")
    
    # Test database creation
    print("Creating database tables...")
    db_manager.create_tables()
    print("✅ Database tables created successfully")
    
    # Test basic operations
    session = db_manager.get_session()
    
    # Test user creation
    test_user = User(username='test_user', email='test@example.com')
    test_user.set_password('password123')
    session.add(test_user)
    session.commit()
    print("✅ Test user created successfully")
    
    # Test product creation
    test_product = Product(
        name='Test Product',
        description='A test product',
        price=99.99,
        category='test',
        brand='TestBrand',
        stock_quantity=10,
        rating=4.5
    )
    session.add(test_product)
    session.commit()
    print("✅ Test product created successfully")
    
    # Clean up
    session.delete(test_user)
    session.delete(test_product)
    session.commit()
    session.close()
    print("✅ Test data cleaned up")
    
    print("\n🎉 Database test completed successfully!")
    print("Your database is ready for the chatbot application.")
    
except Exception as e:
    print(f"❌ Error: {str(e)}")
    import traceback
    traceback.print_exc()
    sys.exit(1) 