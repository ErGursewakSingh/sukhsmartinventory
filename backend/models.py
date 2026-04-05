from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()


# ---------------- USER ----------------
class User(db.Model):
    __tablename__ = "user"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)

    # 🔥 Relationship
    products = db.relationship("Product", backref="user", lazy=True)


# ---------------- PRODUCT ----------------
class Product(db.Model):
    __tablename__ = "product"

    id = db.Column(db.Integer, primary_key=True)

    name = db.Column(db.String(150), nullable=False)
    category = db.Column(db.String(100))
    price = db.Column(db.Float, nullable=False)
    quantity = db.Column(db.Integer, default=0)

    supplier = db.Column(db.String(100))  

    
    is_auto = db.Column(db.Boolean, default=False)

    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    
    price_history = db.relationship(
        "PriceHistory",
        backref="product",
        lazy=True,
        cascade="all, delete-orphan"
    )

    alerts = db.relationship(
        "PriceAlert",
        backref="product",
        lazy=True,
        cascade="all, delete-orphan"
    )


# ---------------- PRICE HISTORY ----------------
class PriceHistory(db.Model):
    __tablename__ = "price_history"

    id = db.Column(db.Integer, primary_key=True)

    product_id = db.Column(
        db.Integer,
        db.ForeignKey('product.id'),
        nullable=False
    )

    price = db.Column(db.Float, nullable=False)

    # Auto timestamp
    date = db.Column(db.DateTime, default=datetime.utcnow)


# ---------------- PRICE ALERT ----------------
class PriceAlert(db.Model):
    __tablename__ = "price_alert"

    id = db.Column(db.Integer, primary_key=True)

    product_id = db.Column(
        db.Integer,
        db.ForeignKey('product.id'),
        nullable=False
    )

    user_id = db.Column(db.Integer, nullable=False)

    target_price = db.Column(db.Float, nullable=False)


# ---------------- NOTIFICATION ----------------
class Notification(db.Model):
    __tablename__ = "notification"

    id = db.Column(db.Integer, primary_key=True)

    message = db.Column(db.String(255), nullable=False)

    is_read = db.Column(db.Boolean, default=False)

    user_id = db.Column(db.Integer, nullable=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

