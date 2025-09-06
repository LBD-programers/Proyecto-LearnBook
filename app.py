# app.py
import os
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from werkzeug.security import generate_password_hash, check_password_hash

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
DB_PATH = os.path.join(BASE_DIR, 'instance', 'learnbook.db')
os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
SQLALCHEMY_DATABASE_URI = f"sqlite:///{DB_PATH}"

app = Flask(__name__, static_folder='static', static_url_path='')
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Configuración SQLAlchemy
engine = create_engine(SQLALCHEMY_DATABASE_URI, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autoflush=False)
Base = declarative_base()

# Modelos
class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    name = Column(String(120), nullable=False)
    email = Column(String(200), unique=True, nullable=False)
    password_hash = Column(String(200), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    feedbacks = relationship("Feedback", back_populates="user")

class Feedback(Base):
    __tablename__ = 'feedbacks'
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    comentario = Column(Text, nullable=False)
    rating = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    user = relationship("User", back_populates="feedbacks")

# Crear tablas
Base.metadata.create_all(bind=engine)

# Rutas
@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index-2.html')

@app.route('/api/register', methods=['POST'])
def register():
    session = SessionLocal()
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not name or not email or not password:
        return jsonify({"error": "Rellena todos los campos."}), 400

    if session.query(User).filter_by(email=email).first():
        session.close()
        return jsonify({"error": "El correo ya está en uso."}), 400

    pw_hash = generate_password_hash(password)
    u = User(name=name, email=email, password_hash=pw_hash)
    session.add(u)
    session.commit()
    session.close()
    return jsonify({"message": "Registro completado."}), 201

@app.route('/api/login', methods=['POST'])
def login():
    session = SessionLocal()
    data = request.get_json() or {}
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''

    if not email or not password:
        return jsonify({"error": "Rellena email y contraseña."}), 400

    user = session.query(User).filter_by(email=email).first()
    if not user or not check_password_hash(user.password_hash, password):
        session.close()
        return jsonify({"error": "Credenciales inválidas."}), 401

    session.close()
    return jsonify({"message": "Inicio de sesión correcto.", "user": {"id": user.id, "name": user.name}}), 200

@app.route('/api/feedback', methods=['POST'])
def feedback():
    session = SessionLocal()
    data = request.get_json() or {}
    comentario = (data.get('comentario') or '').strip()
    rating = int(data.get('rating') or 0)

    if not comentario:
        return jsonify({"error": "Comentario vacío."}), 400

    fb = Feedback(comentario=comentario, rating=rating)
    session.add(fb)
    session.commit()
    session.close()
    return jsonify({"message": "Feedback recibido."}), 201

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)