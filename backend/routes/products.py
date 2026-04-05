from flask import Blueprint, request, jsonify
from models import db, Product, PriceHistory, PriceAlert, Notification
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import or_

product_bp = Blueprint("products", __name__)

# ---------------- GET PRODUCTS ---------------- #
def get_trend(history):
    if len(history) < 2:
        return "Stable"

    first = history[0].price
    last = history[-1].price

    if last > first:
        return "Rising"
    elif last < first:
        return "Falling"
    else:
        return "Stable"
    
@product_bp.route("/products", methods=["GET"])
@jwt_required()
def get_products():
    user_id = int(get_jwt_identity())

    products = Product.query.filter(
        Product.user_id == user_id
    ).all()

    return jsonify([
        {
            "id": p.id,
            "name": p.name,
            "price": p.price,
            "category": p.category,
            "quantity": p.quantity,
            "supplier": p.supplier,
            "is_auto": p.is_auto
        }
        for p in products
    ])

# ---------------- ADD PRODUCT ---------------- #
@product_bp.route("/products", methods=["POST"])
@jwt_required()
def add_product():
    user_id = int(get_jwt_identity())
    data = request.json
    
    product = Product(
        name=data["name"],
        category=data.get("category"),
        price=data["price"],
        quantity=data.get("quantity", 0),
        supplier=data.get("supplier", 'Manual'),
        user_id=user_id
    )

    db.session.add(product)
    db.session.flush()

    db.session.add(PriceHistory(
        product_id=product.id,
        price=product.price
    ))

    db.session.commit()

    return jsonify({"message": "Product Added"})

# ---------------- UPDATE PRODUCT ---------------- #
@product_bp.route("/products/<int:id>", methods=["PUT"])
@jwt_required()
def update_product(id):
    user_id = int(get_jwt_identity())
    data = request.json
    
    product = Product.query.filter_by(id=id, user_id=user_id).first()

    if not product or product.user_id != user_id:
        return jsonify({"message": "Unauthorized"}), 403

    #  BLOCK AUTO PRODUCTS
    if product.is_auto:
        return jsonify({"message": "Auto products cannot be edited"}), 400

    old_price = product.price

    product.name = data.get("name", product.name)
    product.category = data.get("category", product.category)
    product.price = data.get("price", product.price)
    product.quantity = data.get("quantity", product.quantity)
    product.supplier = data.get("supplier", product.supplier)

    if product.price != old_price:
        db.session.add(PriceHistory(
            product_id=product.id,
            price=product.price
        ))

    db.session.commit()

    return jsonify({"message": "Product updated"})

# ---------------- DELETE ---------------- #
@product_bp.route("/products/<int:id>", methods=["DELETE"])
@jwt_required()
def delete_product(id):
    user_id = int(get_jwt_identity())

    product = Product.query.filter_by(id=id, user_id=user_id).first()

    if not product or product.user_id != user_id:
        return jsonify({"message": "Unauthorized"}), 403

    db.session.delete(product)
    db.session.commit()

    return jsonify({"message": "Deleted"})
# ---------------- HISTORY ---------------- #
@product_bp.route("/products/<int:id>/history", methods=["GET"])
@jwt_required()
def get_history(id):
    user_id = int(get_jwt_identity())

    product = Product.query.filter_by(id=id, user_id=user_id).first()

    product = db.session.get(Product, id)

    if not product or product.user_id != int(get_jwt_identity()):
        return jsonify({"message": "Unauthorized"}), 403

    history = PriceHistory.query.filter_by(product_id=id).all()

    return jsonify([
        {
            "price": h.price,
            "date": h.date.isoformat()
        }
        for h in history
    ])

# ---------------- ALERT ---------------- #
@product_bp.route("/products/<int:id>/set-alert", methods=["POST"])
@jwt_required()
def set_alert(id):
    data = request.json
    user_id = int(get_jwt_identity())

    alert = PriceAlert(
        product_id=id,
        user_id=user_id,
        target_price=data["target_price"]
    )

    db.session.add(alert)
    db.session.commit()

    return jsonify({"message": "Alert set"})
# ---------------- INSIGHTS ---------------- #
# ---------------- INSIGHTS ---------------- #
@product_bp.route("/products/insights", methods=["GET"])
@jwt_required()
def get_insights():
    user_id = int(get_jwt_identity())

    products = Product.query.filter_by(user_id=user_id).all()

    #  LOW STOCK LIST 
    low_stock_items = [
        {
            "id": p.id,
            "name": p.name,
            "quantity": p.quantity
        }
        for p in products if p.quantity <= 5
    ]

    #  BIGGEST DROPS LIST 
    drops = []

    for p in products:
        history = PriceHistory.query.filter_by(product_id=p.id)\
            .order_by(PriceHistory.date).all()

        if len(history) >= 2:
            first = history[0].price
            last = history[-1].price

            drop = first - last

            if drop > 0:
                drops.append({
                    "id": p.id,
                    "name": p.name,
                    "drop": round(drop, 2)
                })

    # sort highest drop first
    drops = sorted(drops, key=lambda x: x["drop"], reverse=True)[:5]

    # ALERT COUNT 
    alerts_count = Notification.query.filter_by(user_id=user_id).count()

    total_value = sum(p.price * p.quantity for p in products)

    return jsonify({
        "low_stock": low_stock_items,
        "biggest_drops": drops,
        "alerts": alerts_count,
        "total_products": len(products),
        "total_value": round(total_value, 2)
    })

@product_bp.route("/products/<int:id>/analytics", methods=["GET"])
@jwt_required()
def product_analytics(id):
    user_id = int(get_jwt_identity())

    product = db.session.get(Product, id)

    if not product or product.user_id != user_id:
        return jsonify({"message": "Unauthorized"}), 403

    history = PriceHistory.query.filter_by(product_id=id)\
        .order_by(PriceHistory.date).all()

    if not history:
        return jsonify({"message": "No data"})

    prices = [h.price for h in history]

    # TREND 
    trend = get_trend(history)  # Rising / Falling / Stable

    # IMPROVED PREDICTION 
    if len(prices) >= 3:
        last3 = prices[-3:]
        weights = [0.2, 0.3, 0.5]

        prediction = (
            last3[0] * weights[0] +
            last3[1] * weights[1] +
            last3[2] * weights[2]
        )
    else:
        prediction = prices[-1]

    prediction = round(prediction, 2)

    # 💡 BETTER RECOMMENDATION
    latest = prices[-1]
    avg_price = sum(prices) / len(prices)

    if trend == "Rising" and latest < avg_price:
        recommendation = "Buy Now"
    elif trend == "Rising":
        recommendation = "Hold"

    elif trend == "Falling" and latest > avg_price:
        recommendation = "Wait"
    elif trend == "Falling":
        recommendation = "Sell"

    else:
        recommendation = "Neutral"

    # 🚨 ANOMALY DETECTION
    anomaly = abs(latest - avg_price) > avg_price * 0.3

    return jsonify({
        "trend": trend,
        "prediction": prediction,
        "recommendation": recommendation,
        "anomaly": anomaly
    })