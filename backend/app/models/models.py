"""
SQLAlchemy Models
Maps database tables to Python classes for ORM operations
"""

from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, DECIMAL, Date
from sqlalchemy.orm import relationship
from ..core.database import Base

class Sale(Base):
    """
    Main sales table model
    Represents a complete transaction with all its details
    """
    __tablename__ = "sales"
    
    id = Column(Integer, primary_key=True, index=True)
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=False)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=True)
    channel_id = Column(Integer, ForeignKey("channels.id"), nullable=False)
    
    created_at = Column(DateTime, nullable=False, index=True)
    customer_name = Column(String(100))
    sale_status_desc = Column(String(100), nullable=False, index=True)
    
    # Financial fields
    total_amount_items = Column(DECIMAL(10, 2), nullable=False)
    total_discount = Column(DECIMAL(10, 2), default=0)
    total_increase = Column(DECIMAL(10, 2), default=0)
    delivery_fee = Column(DECIMAL(10, 2), default=0)
    service_tax_fee = Column(DECIMAL(10, 2), default=0)
    total_amount = Column(DECIMAL(10, 2), nullable=False)
    value_paid = Column(DECIMAL(10, 2), default=0)
    
    # Operational metrics
    production_seconds = Column(Integer)
    delivery_seconds = Column(Integer)
    people_quantity = Column(Integer)
    
    discount_reason = Column(String(300))
    origin = Column(String(100), default='POS')
    
    # Relationships
    store = relationship("Store", back_populates="sales")
    customer = relationship("Customer", back_populates="sales")
    channel = relationship("Channel", back_populates="sales")
    product_sales = relationship("ProductSale", back_populates="sale", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="sale", cascade="all, delete-orphan")
    delivery_sale = relationship("DeliverySale", back_populates="sale", uselist=False)

class Store(Base):
    """Store/Restaurant locations"""
    __tablename__ = "stores"
    
    id = Column(Integer, primary_key=True, index=True)
    brand_id = Column(Integer, ForeignKey("brands.id"))
    name = Column(String(255), nullable=False)
    city = Column(String(100))
    state = Column(String(2))
    latitude = Column(DECIMAL(9, 6))
    longitude = Column(DECIMAL(9, 6))
    is_active = Column(Boolean, default=True)
    is_own = Column(Boolean, default=False)
    
    sales = relationship("Sale", back_populates="store")

class Channel(Base):
    """Sales channels (iFood, Rappi, etc)"""
    __tablename__ = "channels"
    
    id = Column(Integer, primary_key=True, index=True)
    brand_id = Column(Integer, ForeignKey("brands.id"))
    name = Column(String(100), nullable=False)
    description = Column(String(255))
    type = Column(String(1))  # P=Presencial, D=Delivery
    
    sales = relationship("Sale", back_populates="channel")

class Customer(Base):
    """Customer information"""
    __tablename__ = "customers"
    
    id = Column(Integer, primary_key=True, index=True)
    customer_name = Column(String(100))
    email = Column(String(100))
    phone_number = Column(String(50))
    cpf = Column(String(100))
    birth_date = Column(Date)
    gender = Column(String(10))
    
    sales = relationship("Sale", back_populates="customer")

class Product(Base):
    """Products catalog"""
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True, index=True)
    brand_id = Column(Integer, ForeignKey("brands.id"))
    category_id = Column(Integer, ForeignKey("categories.id"))
    name = Column(String(500), nullable=False)
    
    category = relationship("Category")
    product_sales = relationship("ProductSale", back_populates="product")

class ProductSale(Base):
    """Products sold in each sale"""
    __tablename__ = "product_sales"
    
    id = Column(Integer, primary_key=True, index=True)
    sale_id = Column(Integer, ForeignKey("sales.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Float, nullable=False)
    base_price = Column(Float, nullable=False)
    total_price = Column(Float, nullable=False)
    observations = Column(String(300))
    
    sale = relationship("Sale", back_populates="product_sales")
    product = relationship("Product", back_populates="product_sales")
    item_product_sales = relationship("ItemProductSale", back_populates="product_sale", cascade="all, delete-orphan")

class Item(Base):
    """Items/Add-ons catalog"""
    __tablename__ = "items"
    
    id = Column(Integer, primary_key=True, index=True)
    brand_id = Column(Integer, ForeignKey("brands.id"))
    category_id = Column(Integer, ForeignKey("categories.id"))
    name = Column(String(500), nullable=False)
    
    item_product_sales = relationship("ItemProductSale", back_populates="item")

class ItemProductSale(Base):
    """Customizations/Add-ons for products"""
    __tablename__ = "item_product_sales"
    
    id = Column(Integer, primary_key=True, index=True)
    product_sale_id = Column(Integer, ForeignKey("product_sales.id"), nullable=False)
    item_id = Column(Integer, ForeignKey("items.id"), nullable=False)
    option_group_id = Column(Integer, ForeignKey("option_groups.id"))
    quantity = Column(Float, nullable=False)
    additional_price = Column(Float, nullable=False)
    price = Column(Float, nullable=False)
    
    product_sale = relationship("ProductSale", back_populates="item_product_sales")
    item = relationship("Item", back_populates="item_product_sales")

class Category(Base):
    """Categories for products and items"""
    __tablename__ = "categories"
    
    id = Column(Integer, primary_key=True, index=True)
    brand_id = Column(Integer, ForeignKey("brands.id"))
    name = Column(String(200), nullable=False)
    type = Column(String(1), default='P')  # P=Product, I=Item

class PaymentType(Base):
    """Payment methods"""
    __tablename__ = "payment_types"
    
    id = Column(Integer, primary_key=True, index=True)
    brand_id = Column(Integer, ForeignKey("brands.id"))
    description = Column(String(100), nullable=False)

class Payment(Base):
    """Payments for each sale"""
    __tablename__ = "payments"
    
    id = Column(Integer, primary_key=True, index=True)
    sale_id = Column(Integer, ForeignKey("sales.id"), nullable=False)
    payment_type_id = Column(Integer, ForeignKey("payment_types.id"))
    value = Column(DECIMAL(10, 2), nullable=False)
    is_online = Column(Boolean, default=False)
    
    sale = relationship("Sale", back_populates="payments")

class DeliverySale(Base):
    """Delivery information for sales"""
    __tablename__ = "delivery_sales"
    
    id = Column(Integer, primary_key=True, index=True)
    sale_id = Column(Integer, ForeignKey("sales.id"), nullable=False)
    courier_name = Column(String(100))
    courier_phone = Column(String(100))
    delivery_type = Column(String(100))
    status = Column(String(100))
    delivery_fee = Column(Float)
    
    sale = relationship("Sale", back_populates="delivery_sale")

class Brand(Base):
    """Brand information"""
    __tablename__ = "brands"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)

class OptionGroup(Base):
    """Option groups for customizations"""
    __tablename__ = "option_groups"
    
    id = Column(Integer, primary_key=True, index=True)
    brand_id = Column(Integer, ForeignKey("brands.id"))
    name = Column(String(500), nullable=False)