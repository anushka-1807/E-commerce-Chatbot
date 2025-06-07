"""
Database initialization script with mock e-commerce product data.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models import db_manager, Product, User
import random

def create_mock_products():
    """Create 100+ mock e-commerce products."""
    
    products_data = [
        # Smartphones (20 products)
        {'name': 'iPhone 15 Pro Max', 'description': 'Latest Apple flagship with A17 Pro chip, titanium design, and advanced camera system.', 'price': 1199.99, 'category': 'smartphones', 'brand': 'Apple', 'stock_quantity': 25, 'image_url': 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400', 'rating': 4.8, 'is_featured': True, 'is_on_sale': False},
        {'name': 'Samsung Galaxy S24 Ultra', 'description': 'Premium Android smartphone with S Pen, 200MP camera, and powerful Snapdragon processor.', 'price': 1299.99, 'category': 'smartphones', 'brand': 'Samsung', 'stock_quantity': 30, 'image_url': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400', 'rating': 4.7, 'is_featured': True, 'is_on_sale': True, 'sale_price': 1199.99},
        {'name': 'Google Pixel 8 Pro', 'description': 'AI-powered photography with Magic Eraser, Night Sight, and pure Android experience.', 'price': 999.99, 'category': 'smartphones', 'brand': 'Google', 'stock_quantity': 20, 'image_url': 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400', 'rating': 4.6, 'is_featured': False, 'is_on_sale': False},
        {'name': 'OnePlus 12', 'description': 'Fast charging flagship with smooth performance, OxygenOS, and premium build quality.', 'price': 799.99, 'category': 'smartphones', 'brand': 'OnePlus', 'stock_quantity': 15, 'image_url': 'https://images.unsplash.com/photo-1567721913486-6585f069b332?w=400', 'rating': 4.5, 'is_featured': False, 'is_on_sale': True, 'sale_price': 699.99},
        {'name': 'iPhone 14', 'description': 'Reliable iPhone with excellent camera, long battery life, and iOS ecosystem integration.', 'price': 799.99, 'category': 'smartphones', 'brand': 'Apple', 'stock_quantity': 40, 'image_url': 'https://images.unsplash.com/photo-1605236453806-b85426f00e23?w=400', 'rating': 4.4, 'is_featured': False, 'is_on_sale': False},
        {'name': 'iPhone 13', 'description': 'High-quality smartphone from Apple with advanced features and reliable performance.', 'price': 699.99, 'category': 'smartphones', 'brand': 'Apple', 'stock_quantity': 32, 'image_url': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400', 'rating': 4.3, 'is_featured': False, 'is_on_sale': False},
        {'name': 'iPhone 12', 'description': 'High-quality smartphone from Apple with advanced features and reliable performance.', 'price': 599.99, 'category': 'smartphones', 'brand': 'Apple', 'stock_quantity': 28, 'image_url': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400', 'rating': 4.2, 'is_featured': False, 'is_on_sale': True, 'sale_price': 509.99},
        {'name': 'Galaxy S23', 'description': 'High-quality smartphone from Samsung with advanced features and reliable performance.', 'price': 899.99, 'category': 'smartphones', 'brand': 'Samsung', 'stock_quantity': 25, 'image_url': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400', 'rating': 4.5, 'is_featured': True, 'is_on_sale': False},
        {'name': 'Galaxy A54', 'description': 'High-quality smartphone from Samsung with advanced features and reliable performance.', 'price': 449.99, 'category': 'smartphones', 'brand': 'Samsung', 'stock_quantity': 45, 'image_url': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400', 'rating': 4.1, 'is_featured': False, 'is_on_sale': True, 'sale_price': 382.49},
        {'name': 'Pixel 7a', 'description': 'High-quality smartphone from Google with advanced features and reliable performance.', 'price': 499.99, 'category': 'smartphones', 'brand': 'Google', 'stock_quantity': 38, 'image_url': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400', 'rating': 4.4, 'is_featured': False, 'is_on_sale': False},
        {'name': 'Pixel 6', 'description': 'High-quality smartphone from Google with advanced features and reliable performance.', 'price': 399.99, 'category': 'smartphones', 'brand': 'Google', 'stock_quantity': 33, 'image_url': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400', 'rating': 4.0, 'is_featured': False, 'is_on_sale': False},
        {'name': 'OnePlus 11', 'description': 'High-quality smartphone from OnePlus with advanced features and reliable performance.', 'price': 749.99, 'category': 'smartphones', 'brand': 'OnePlus', 'stock_quantity': 22, 'image_url': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400', 'rating': 4.3, 'is_featured': False, 'is_on_sale': True, 'sale_price': 637.49},
        {'name': 'OnePlus Nord 3', 'description': 'High-quality smartphone from OnePlus with advanced features and reliable performance.', 'price': 349.99, 'category': 'smartphones', 'brand': 'OnePlus', 'stock_quantity': 41, 'image_url': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400', 'rating': 4.0, 'is_featured': False, 'is_on_sale': False},
        {'name': 'Xiaomi 13 Pro', 'description': 'High-quality smartphone from Xiaomi with advanced features and reliable performance.', 'price': 899.99, 'category': 'smartphones', 'brand': 'Xiaomi', 'stock_quantity': 19, 'image_url': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400', 'rating': 4.2, 'is_featured': True, 'is_on_sale': False},
        {'name': 'Xiaomi Redmi Note 12', 'description': 'High-quality smartphone from Xiaomi with advanced features and reliable performance.', 'price': 249.99, 'category': 'smartphones', 'brand': 'Xiaomi', 'stock_quantity': 50, 'image_url': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400', 'rating': 3.9, 'is_featured': False, 'is_on_sale': True, 'sale_price': 212.49},
        
        # Laptops (25 products)
        {'name': 'MacBook Pro 16-inch M3 Max', 'description': 'Professional laptop with M3 Max chip, 16-inch Liquid Retina XDR display, and up to 22 hours battery life.', 'price': 3499.99, 'category': 'laptops', 'brand': 'Apple', 'stock_quantity': 12, 'image_url': 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400', 'rating': 4.9, 'is_featured': True, 'is_on_sale': False},
        {'name': 'Dell XPS 15', 'description': 'Premium Windows laptop with Intel Core i7, NVIDIA RTX graphics, and stunning 4K OLED display.', 'price': 2299.99, 'category': 'laptops', 'brand': 'Dell', 'stock_quantity': 18, 'image_url': 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400', 'rating': 4.6, 'is_featured': True, 'is_on_sale': True, 'sale_price': 1999.99},
        {'name': 'ASUS ROG Strix G15', 'description': 'Gaming laptop with AMD Ryzen 9, NVIDIA RTX 4070, RGB keyboard, and advanced cooling system.', 'price': 1799.99, 'category': 'laptops', 'brand': 'ASUS', 'stock_quantity': 22, 'image_url': 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400', 'rating': 4.7, 'is_featured': False, 'is_on_sale': False},
        {'name': 'HP Spectre x360', 'description': '2-in-1 convertible laptop with touchscreen, Intel Evo platform, and premium design.', 'price': 1499.99, 'category': 'laptops', 'brand': 'HP', 'stock_quantity': 16, 'image_url': 'https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=400', 'rating': 4.4, 'is_featured': False, 'is_on_sale': True, 'sale_price': 1299.99},
        {'name': 'Lenovo ThinkPad X1 Carbon', 'description': 'Business ultrabook with military-grade durability, excellent keyboard, and long battery life.', 'price': 1899.99, 'category': 'laptops', 'brand': 'Lenovo', 'stock_quantity': 14, 'image_url': 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400', 'rating': 4.5, 'is_featured': False, 'is_on_sale': False},
        {'name': 'MacBook Air M2', 'description': 'Powerful Apple laptop designed for productivity and performance with modern features.', 'price': 1199.99, 'category': 'laptops', 'brand': 'Apple', 'stock_quantity': 20, 'image_url': 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400', 'rating': 4.6, 'is_featured': True, 'is_on_sale': False},
        {'name': 'MacBook Air M1', 'description': 'Powerful Apple laptop designed for productivity and performance with modern features.', 'price': 999.99, 'category': 'laptops', 'brand': 'Apple', 'stock_quantity': 25, 'image_url': 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400', 'rating': 4.5, 'is_featured': False, 'is_on_sale': True, 'sale_price': 899.99},
        {'name': 'Surface Laptop 5', 'description': 'Powerful Microsoft laptop designed for productivity and performance with modern features.', 'price': 1299.99, 'category': 'laptops', 'brand': 'Microsoft', 'stock_quantity': 18, 'image_url': 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400', 'rating': 4.3, 'is_featured': False, 'is_on_sale': False},
        
        # Headphones (20 products)
        {'name': 'Sony WH-1000XM5', 'description': 'Industry-leading noise cancellation with exceptional sound quality and 30-hour battery life.', 'price': 399.99, 'category': 'headphones', 'brand': 'Sony', 'stock_quantity': 35, 'image_url': 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400', 'rating': 4.8, 'is_featured': True, 'is_on_sale': False},
        {'name': 'Apple AirPods Pro 2nd Gen', 'description': 'Active noise cancellation, spatial audio, and seamless Apple ecosystem integration.', 'price': 249.99, 'category': 'headphones', 'brand': 'Apple', 'stock_quantity': 50, 'image_url': 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400', 'rating': 4.7, 'is_featured': True, 'is_on_sale': True, 'sale_price': 199.99},
        {'name': 'Bose QuietComfort 45', 'description': 'Legendary comfort and noise cancellation with balanced audio performance.', 'price': 329.99, 'category': 'headphones', 'brand': 'Bose', 'stock_quantity': 28, 'image_url': 'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=400', 'rating': 4.6, 'is_featured': False, 'is_on_sale': False},
        {'name': 'JBL Live 660NC', 'description': 'Wireless over-ear headphones with adaptive noise cancelling and powerful JBL signature sound.', 'price': 199.99, 'category': 'headphones', 'brand': 'JBL', 'stock_quantity': 42, 'image_url': 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400', 'rating': 4.3, 'is_featured': False, 'is_on_sale': True, 'sale_price': 149.99},
        
        # Tablets (15 products)
        {'name': 'iPad Pro 12.9-inch M2', 'description': 'Professional tablet with M2 chip, Liquid Retina XDR display, and Apple Pencil support.', 'price': 1099.99, 'category': 'tablets', 'brand': 'Apple', 'stock_quantity': 20, 'image_url': 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400', 'rating': 4.8, 'is_featured': True, 'is_on_sale': False},
        {'name': 'Samsung Galaxy Tab S9 Ultra', 'description': 'Large Android tablet with S Pen, AMOLED display, and powerful performance for productivity.', 'price': 1199.99, 'category': 'tablets', 'brand': 'Samsung', 'stock_quantity': 15, 'image_url': 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=400', 'rating': 4.6, 'is_featured': False, 'is_on_sale': True, 'sale_price': 999.99},
        {'name': 'Microsoft Surface Pro 9', 'description': '2-in-1 tablet and laptop with Windows 11, Intel processors, and detachable keyboard.', 'price': 999.99, 'category': 'tablets', 'brand': 'Microsoft', 'stock_quantity': 18, 'image_url': 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400', 'rating': 4.4, 'is_featured': False, 'is_on_sale': False},
        
        # Smartwatches (10 products)
        {'name': 'Apple Watch Ultra 2', 'description': 'Rugged smartwatch for athletes and adventurers with precision GPS, cellular connectivity, and extreme durability.', 'price': 799.99, 'category': 'smartwatches', 'brand': 'Apple', 'stock_quantity': 25, 'image_url': 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=400', 'rating': 4.7, 'is_featured': True, 'is_on_sale': False},
        {'name': 'Samsung Galaxy Watch 6', 'description': 'Comprehensive health tracking with sleep monitoring, GPS, and seamless Android integration.', 'price': 329.99, 'category': 'smartwatches', 'brand': 'Samsung', 'stock_quantity': 30, 'image_url': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400', 'rating': 4.5, 'is_featured': False, 'is_on_sale': True, 'sale_price': 279.99},
        
        # Accessories (30 products)
        {'name': 'Anker PowerCore 10000', 'description': 'Compact portable charger with 10000mAh capacity and fast charging technology.', 'price': 29.99, 'category': 'accessories', 'brand': 'Anker', 'stock_quantity': 100, 'image_url': 'https://images.unsplash.com/photo-1609592806191-ed6bb83d49fc?w=400', 'rating': 4.6, 'is_featured': False, 'is_on_sale': False},
        {'name': 'Logitech MX Master 3S', 'description': 'Premium wireless mouse with precision tracking, customizable buttons, and ergonomic design.', 'price': 99.99, 'category': 'accessories', 'brand': 'Logitech', 'stock_quantity': 60, 'image_url': 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400', 'rating': 4.8, 'is_featured': False, 'is_on_sale': True, 'sale_price': 79.99}
    ]
    
    return products_data

def create_sample_users():
    """Create sample users for testing."""
    users_data = [
        {
            'username': 'Adi',
            'email': 'adi@example.com',
            'password': 'Aditya123@'
        },
        {
            'username': 'test_customer',
            'email': 'customer@test.com',
            'password': 'testpass'
        }
    ]
    
    return users_data

def initialize_database():
    """Initialize the database with mock data."""
    print("Initializing database...")
    
    # Create tables
    db_manager.create_tables()
    print("✓ Database tables created")
    
    session = db_manager.get_session()
    
    try:
        # Check if data already exists
        existing_products = session.query(Product).count()
        if existing_products > 0:
            print(f"Database already contains {existing_products} products")
            response = input("Do you want to reset the database? (y/N): ")
            if response.lower() != 'y':
                print("Database initialization cancelled")
                return
            
            # Clear existing data
            session.query(Product).delete()
            session.query(User).delete()
            session.commit()
            print("✓ Existing data cleared")
        
        # Create products
        products_data = create_mock_products()
        products = []
        
        for product_data in products_data:
            product = Product(**product_data)
            products.append(product)
        
        session.add_all(products)
        session.commit()
        print(f"✓ Created {len(products)} products")
        
        # Create sample users
        users_data = create_sample_users()
        users = []
        
        for user_data in users_data:
            user = User(
                username=user_data['username'],
                email=user_data['email']
            )
            user.set_password(user_data['password'])
            users.append(user)
        
        session.add_all(users)
        session.commit()
        print(f"✓ Created {len(users)} sample users")
        
        # Print summary
        print("\n🎉 Database initialization complete!")
        print(f"📊 Total products: {len(products)}")
        print(f"👥 Total users: {len(users)}")
        
        # Print category breakdown
        categories = {}
        for product in products:
            category = product.category
            categories[category] = categories.get(category, 0) + 1
        
        print("\n📈 Product categories:")
        for category, count in categories.items():
            print(f"  • {category.title()}: {count} products")
        
        print("\n🔐 Demo credentials:")
        print("  Username: Adi")
        print("  Password: Aditya123@")
        
    except Exception as e:
        session.rollback()
        print(f"❌ Error initializing database: {str(e)}")
        raise
    finally:
        db_manager.close_session(session)

if __name__ == "__main__":
    initialize_database()