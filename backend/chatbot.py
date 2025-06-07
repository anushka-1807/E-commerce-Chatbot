"""
Chatbot logic with natural language processing for product search and recommendations.
"""

import re
import json
from datetime import datetime
from fuzzywuzzy import fuzz
from sqlalchemy import or_, and_
from models import Product, ChatSession, ChatMessage, db_manager, User
import secrets

class ChatbotEngine:
    """Main chatbot engine for processing user queries and generating responses."""
    
    def __init__(self):
        self.greeting_patterns = [
            r'\b(hi|hello|hey|good morning|good afternoon|good evening)\b',
            r'\b(howdy|greetings|what\'s up|whats up)\b'
        ]
        
        self.search_patterns = {
            'product_search': [
                r'\b(show|find|search|look for|get|need|want)\b.*\b(product|item|thing)\b',
                r'\b(i need|i want|looking for|searching for)\b',
                r'\b(show me|find me|get me)\b'
            ],
            'price_filter': [
                r'\$(\d+(?:\.\d{2})?)',
                r'\b(under|below|less than|cheaper than)\s*\$?(\d+)',
                r'\b(over|above|more than|expensive than)\s*\$?(\d+)',
                r'\b(between)\s*\$?(\d+)\s*(?:and|to|-)\s*\$?(\d+)\b'
            ],
            'category_keywords': {
                'smartphones': ['phone', 'smartphone', 'mobile', 'cell phone', 'iphone', 'android'],
                'laptops': ['laptop', 'computer', 'notebook', 'macbook', 'pc'],
                'headphones': ['headphone', 'earphone', 'earbuds', 'headset', 'airpods'],
                'tablets': ['tablet', 'ipad', 'surface'],
                'smartwatches': ['watch', 'smartwatch', 'fitness tracker'],
                'accessories': ['case', 'charger', 'cable', 'adapter', 'stand']
            },
            'brand_keywords': [
                'apple', 'samsung', 'google', 'microsoft', 'sony', 'bose', 'jbl',
                'dell', 'hp', 'lenovo', 'asus', 'acer', 'huawei', 'xiaomi', 'oneplus'
            ]
        }
    
    def process_message(self, user_id, message, session_token=None):
        """Process incoming user message and generate response."""
        session = db_manager.get_session()
        try:
            # Get or create chat session
            if not session_token:
                session_token = self._create_session_token()
            
            chat_session = self._get_or_create_chat_session(session, user_id, session_token)
            
            # Save user message
            user_message = ChatMessage(
                session_id=chat_session.id,
                message_type='user',
                content=message,
                timestamp=datetime.utcnow()
            )
            session.add(user_message)
            
            # Generate bot response
            response = self._generate_response(session, message)
            
            # Save bot response
            bot_message = ChatMessage(
                session_id=chat_session.id,
                message_type='bot',
                content=response['text'],
                timestamp=datetime.utcnow(),
                message_metadata=json.dumps(response.get('metadata', {}))
            )
            session.add(bot_message)
            
            session.commit()
            
            return {
                'response': response,
                'session_token': session_token,
                'session_id': chat_session.id
            }
            
        except Exception as e:
            session.rollback()
            return {
                'response': {
                    'text': f'Sorry, I encountered an error: {str(e)}',
                    'type': 'error'
                },
                'session_token': session_token
            }
        finally:
            db_manager.close_session(session)
    
    def _generate_response(self, db_session, message):
        """Generate appropriate response based on user message."""
        message_lower = message.lower()
        
        # Check for greetings
        if self._is_greeting(message_lower):
            return self._greeting_response()
        
        # Check for product search
        if self._is_product_search(message_lower):
            return self._search_products(db_session, message_lower)
        
        # Check for help request
        if any(word in message_lower for word in ['help', 'what can you do', 'how does this work']):
            return self._help_response()
        
        # Default response with suggestions
        return self._default_response()
    
    def _is_greeting(self, message):
        """Check if message is a greeting."""
        for pattern in self.greeting_patterns:
            if re.search(pattern, message, re.IGNORECASE):
                return True
        return False
    
    def _is_product_search(self, message):
        """Check if message is a product search query."""
        for pattern in self.search_patterns['product_search']:
            if re.search(pattern, message, re.IGNORECASE):
                return True
        
        # Also check for category keywords
        for category, keywords in self.search_patterns['category_keywords'].items():
            if any(keyword in message for keyword in keywords):
                return True
        
        return False
    
    def _search_products(self, db_session, message):
        """Search for products based on user message."""
        try:
            # Extract search criteria
            criteria = self._extract_search_criteria(message)
            
            # Build query
            query = db_session.query(Product)
            
            # Apply filters
            if criteria['keywords']:
                keyword_filter = []
                for keyword in criteria['keywords']:
                    keyword_filter.append(Product.name.ilike(f'%{keyword}%'))
                    keyword_filter.append(Product.description.ilike(f'%{keyword}%'))
                query = query.filter(or_(*keyword_filter))
            
            if criteria['category']:
                query = query.filter(Product.category.ilike(f'%{criteria["category"]}%'))
            
            if criteria['brand']:
                query = query.filter(Product.brand.ilike(f'%{criteria["brand"]}%'))
            
            if criteria['min_price'] is not None:
                query = query.filter(Product.price >= criteria['min_price'])
            
            if criteria['max_price'] is not None:
                query = query.filter(Product.price <= criteria['max_price'])
            
            # Get results
            products = query.limit(10).all()
            
            if not products:
                return {
                    'text': "I couldn't find any products matching your criteria. Try being more specific or browse our categories.",
                    'type': 'no_results'
                }
            
            # Format response
            response_text = f"I found {len(products)} product{'s' if len(products) != 1 else ''} for you:\n\n"
            
            product_data = []
            for product in products:
                product_data.append(product.to_dict())
                response_text += f"📱 **{product.name}**\n"
                response_text += f"💰 ${product.get_display_price():.2f}"
                if product.is_on_sale:
                    response_text += f" ~~${product.price:.2f}~~ (On Sale!)"
                response_text += f"\n⭐ {product.rating}/5.0 | 📦 {product.stock_quantity} in stock\n"
                response_text += f"{product.description[:100]}...\n\n"
            
            return {
                'text': response_text,
                'type': 'product_list',
                'products': product_data,
                'metadata': {
                    'search_criteria': criteria,
                    'total_results': len(products)
                }
            }
            
        except Exception as e:
            return {
                'text': f"Sorry, I had trouble searching for products. Error: {str(e)}",
                'type': 'error'
            }
    
    def _extract_search_criteria(self, message):
        """Extract search criteria from user message."""
        criteria = {
            'keywords': [],
            'category': None,
            'brand': None,
            'min_price': None,
            'max_price': None
        }
        
        # Extract price ranges
        price_matches = re.findall(r'\$?(\d+(?:\.\d{2})?)', message)
        if price_matches:
            prices = [float(p) for p in price_matches]
            if 'under' in message or 'below' in message or 'less than' in message:
                criteria['max_price'] = min(prices)
            elif 'over' in message or 'above' in message or 'more than' in message:
                criteria['min_price'] = max(prices)
            elif 'between' in message and len(prices) >= 2:
                criteria['min_price'] = min(prices[:2])
                criteria['max_price'] = max(prices[:2])
        
        # Extract category
        for category, keywords in self.search_patterns['category_keywords'].items():
            if any(keyword in message for keyword in keywords):
                criteria['category'] = category
                break
        
        # Extract brand
        for brand in self.search_patterns['brand_keywords']:
            if brand in message:
                criteria['brand'] = brand
                break
        
        # Extract general keywords
        words = message.split()
        stop_words = {'i', 'need', 'want', 'looking', 'for', 'show', 'me', 'find', 'get', 'a', 'an', 'the', 'some', 'any'}
        keywords = [word.strip('.,!?') for word in words if len(word) > 2 and word.lower() not in stop_words]
        criteria['keywords'] = keywords[:3]  # Limit to 3 keywords
        
        return criteria
    
    def _greeting_response(self):
        """Generate greeting response."""
        greetings = [
            "Hello! 👋 I'm your shopping assistant. I can help you find products, compare prices, and answer questions about our inventory.",
            "Hi there! 🛍️ Welcome to our store! I'm here to help you find the perfect products. What are you looking for today?",
            "Hey! 😊 I'm your personal shopping assistant. Ask me about products, prices, or just tell me what you need!"
        ]
        import random
        return {
            'text': random.choice(greetings),
            'type': 'greeting'
        }
    
    def _help_response(self):
        """Generate help response."""
        return {
            'text': """🤖 **I can help you with:**

• **Product Search**: "Show me smartphones under $500"
• **Category Browsing**: "I need a laptop for gaming"
• **Brand Filtering**: "Find me Samsung products"
• **Price Comparisons**: "What's the cheapest tablet?"
• **Product Details**: Ask about specifications, reviews, and availability

**Try asking me:**
- "Show me the latest smartphones"
- "I need headphones under $100"
- "What laptops do you recommend?"
- "Find me Apple products on sale"

Just type what you're looking for in natural language! 🛍️""",
            'type': 'help'
        }
    
    def _default_response(self):
        """Generate default response for unrecognized queries."""
        return {
            'text': """I'm not sure what you're looking for. 🤔

Try asking me about:
• Specific products (smartphones, laptops, headphones)
• Price ranges ("under $300")
• Brands (Apple, Samsung, Sony)
• Categories (electronics, accessories)

Or type "help" to see what I can do! 💡""",
            'type': 'default'
        }
    
    def _get_or_create_chat_session(self, db_session, user_id, session_token):
        """Get existing chat session or create new one."""
        chat_session = db_session.query(ChatSession).filter(
            ChatSession.session_token == session_token
        ).first()
        
        if not chat_session:
            chat_session = ChatSession(
                user_id=user_id,
                session_token=session_token,
                created_at=datetime.utcnow()
            )
            db_session.add(chat_session)
            db_session.flush()  # Get the ID
        
        return chat_session
    
    def _create_session_token(self):
        """Create unique session token."""
        return secrets.token_urlsafe(32)
    
    def get_chat_history(self, user_id, session_token=None, limit=50):
        """Get chat history for user."""
        session = db_manager.get_session()
        try:
            query = session.query(ChatMessage).join(ChatSession).filter(
                ChatSession.user_id == user_id
            )
            
            if session_token:
                query = query.filter(ChatSession.session_token == session_token)
            
            messages = query.order_by(ChatMessage.timestamp.desc()).limit(limit).all()
            
            return [msg.to_dict() for msg in reversed(messages)]
            
        finally:
            db_manager.close_session(session)
    
    def get_user_sessions(self, user_id):
        """Get all chat sessions for a user."""
        session = db_manager.get_session()
        try:
            sessions = session.query(ChatSession).filter(
                ChatSession.user_id == user_id
            ).order_by(ChatSession.updated_at.desc()).all()
            
            return [s.to_dict() for s in sessions]
            
        finally:
            db_manager.close_session(session)

# Global chatbot instance
chatbot = ChatbotEngine() 