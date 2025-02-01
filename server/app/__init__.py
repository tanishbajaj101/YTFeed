from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from .config import Config
from .models import db
from .routes import routes_bp
from .auth import auth_bp, init_oauth  # Import auth routes

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize extensions
    db.init_app(app)
    CORS(app)
    init_oauth(app)  # Initialize Google OAuth

    # Register blueprints
    app.register_blueprint(routes_bp)
    app.register_blueprint(auth_bp, url_prefix='/auth')

    with app.app_context():
        db.create_all()  # Ensure database is created

    return app
