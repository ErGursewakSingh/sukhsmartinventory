import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = "this-is-a-very-long-secret-key-123456789"
    JWT_SECRET_KEY = "super-secure-jwt-secret-key-123456789"
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL")
    SQLALCHEMY_TRACK_MODIFICATIONS = False