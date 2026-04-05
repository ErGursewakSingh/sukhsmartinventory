from flask import Flask, request, jsonify
from config import Config
from models import db, User, Product, PriceAlert, Notification, PriceHistory
from flask_jwt_extended import (
    JWTManager, create_access_token,
    jwt_required, get_jwt_identity
)
from flask_cors import CORS
from routes.products import product_bp
from werkzeug.security import generate_password_hash, check_password_hash

from apscheduler.schedulers.background import BackgroundScheduler
import requests
import random
from datetime import datetime

# ---------------- APP INIT ---------------- #
app = Flask(__name__)
app.config.from_object(Config)

db.init_app(app)
CORS(app, supports_credentials=True)
jwt = JWTManager(app)

app.register_blueprint(product_bp)

# ---------------- DB CREATE ---------------- #
with app.app_context():
    db.create_all()

# ---------------- ALERT LOGIC ---------------- #
def check_alerts_logic():
    print("🔔 Checking alerts...")

    
    alerts = PriceAlert.query.all()
    print("Alerts in DB:", alerts)

    for alert in alerts:
        product = Product.query.filter_by(
            id=alert.product_id,
            user_id=alert.user_id
        ).first()

        if not product:
            continue

        if product.price <= alert.target_price:
            message = f"{product.name} dropped to ₹{int(product.price)}"

            existing = Notification.query.filter_by(
                user_id=alert.user_id,
                message=message
            ).first()

            if not existing:
                db.session.add(Notification(
                    message=message,
                    user_id=alert.user_id
                ))

    db.session.commit()

# ---------------- PRICE UPDATE ---------------- #
def update_prices():
    print("🔄 Updating prices...")

    products = Product.query.filter_by(supplier="FakeStore").all()

    for product in products:
        old_price = product.price

        change = random.uniform(-20, 20)
        new_price = round(old_price + (old_price * change / 100), 2)
        new_price = max(new_price, 1)

        if new_price != old_price:
            product.price = new_price

            db.session.add(PriceHistory(
                product_id=product.id,
                price=new_price,
                date=datetime.utcnow()
            ))

    db.session.commit()
    print("✅ Prices updated")

# ---------------- FAKE STORE FETCH ---------------- #
def fetch_fake_products():
    print("🌐 Fetching FakeStore products...")

    try:
        res = requests.get("https://fakestoreapi.com/products", timeout=5)

        if res.status_code != 200:
            print("❌ API failed:", res.status_code)
            return

        if not res.text:
            print("❌ Empty response")
            return

        try:
            data = res.json()
        except:
            print("❌ Invalid JSON")
            return



    except Exception as e:
        print("❌ Fetch error:", e)
        return

    for item in data[:5]:

        #  Check if product exists
        product = Product.query.filter_by(name=item['title']).first()

        if product:
            continue  # skip existing

        # Add new product
        new_product = Product(
            name=item['title'],
            category=item['category'],
            price=item['price'],
            quantity=random.randint(5, 20),
            supplier="FakeStore",
            user_id=1   # ⚠️ ensure user 1 exists
        )

        db.session.add(new_product)
        db.session.flush()

        #  Add history
        db.session.add(PriceHistory(
            product_id=new_product.id,
            price=new_product.price,
            date=datetime.utcnow()
        ))

    db.session.commit()
    print("✅ Fake products added")

# ---------------- SCHEDULER ---------------- #
scheduler = BackgroundScheduler()

def job_all():
    with app.app_context():
        fetch_fake_products()
        update_prices()
        check_alerts_logic()

scheduler.add_job(job_all, "interval", minutes=5)

# ---------------- AUTH ---------------- #
@app.route('/register', methods=['POST'])
def register():
    data = request.json

    if not data or not data.get('username') or not data.get('password'):
        return jsonify({"message": "Missing fields"}), 400

    if User.query.filter_by(username=data['username']).first():
        return jsonify({"message": "User exists"}), 400

    user = User(
        username=data['username'],
        password=generate_password_hash(data['password'])
    )

    db.session.add(user)
    db.session.commit()

    return jsonify({"message": "Registered successfully"}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.json

    if not data:
        return jsonify({"message": "No data"}), 400

    user = User.query.filter_by(username=data['username']).first()

    if not user or not check_password_hash(user.password, data['password']):
        return jsonify({"message": "Invalid credentials"}), 401

    token = create_access_token(identity=str(user.id))
    return jsonify({"token": token})

@app.route('/me')
@jwt_required()
def get_me():
    user = User.query.get(int(get_jwt_identity()))
    return jsonify({
        "username": user.username
    })

# ---------------- ROUTES ---------------- #
@app.route('/')
def home():
    return "Server running"

@app.route('/dashboard')
@jwt_required()
def dashboard():
    user = User.query.get(int(get_jwt_identity()))
    return jsonify({"message": f"Welcome {user.username}"})

@app.route('/notifications', methods=['GET'])
@jwt_required()
def get_notifications():
    user_id = int(get_jwt_identity())

    notifications = Notification.query.filter_by(
        user_id=user_id
    ).order_by(Notification.id.desc()).all()

    return jsonify([
        {
            "id": n.id,
            "message": n.message,
            "is_read": n.is_read
        }
        for n in notifications
    ])

@app.route('/notifications/unread-count', methods=['GET'])
@jwt_required()
def unread_count():
    user_id = int(get_jwt_identity())

    count = Notification.query.filter_by(
        user_id=user_id,
        is_read=False
    ).count()

    return jsonify({"unread": count})

@app.route('/notifications/<int:id>/read', methods=['PUT'])
@jwt_required()
def mark_read(id):
    notification = db.session.get(Notification, id)

    if not notification:
        return jsonify({"message": "Not found"}), 404

    notification.is_read = True
    db.session.commit()

    return jsonify({"message": "Marked as read"})

# ---------------- RUN ---------------- #
import os

if __name__ == "__main__":
    scheduler.start()
    print("✅ Scheduler started")
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))