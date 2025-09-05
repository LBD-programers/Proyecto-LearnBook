from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3
import os
import smtplib
from email.message import EmailMessage

DB_PATH = 'learnbook.db'
EMAIL_USER = os.environ.get('LEARNBOOK_EMAIL_USER')  # poner en .env o variables de entorno
EMAIL_PASS = os.environ.get('LEARNBOOK_EMAIL_PASS')
EMAIL_TO = os.environ.get('LEARNBOOK_EMAIL_TO', EMAIL_USER)  # a quién se envían los feedbacks

app = Flask(__name__)
CORS(app)

def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    # tabla usuarios
    c.execute('''
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    ''')
    # tabla feedback
    c.execute('''
      CREATE TABLE IF NOT EXISTS feedback (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        comentario TEXT NOT NULL,
        rating INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    ''')
    conn.commit()
    conn.close()

@app.before_first_request
def startup():
    init_db()

# Helper: ejecutar consultas
def db_execute(query, params=(), fetchone=False, fetchall=False, commit=False):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    cur.execute(query, params)
    result = None
    if fetchone:
        result = cur.fetchone()
    if fetchall:
        result = cur.fetchall()
    if commit:
        conn.commit()
    conn.close()
    return result

# Endpoint: registro
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    name = data.get('name','').strip()
    email = data.get('email','').strip().lower()
    password = data.get('password','')
    if not (name and email and password):
        return jsonify({'error':'Todos los campos son obligatorios.'}), 400
    if len(password) < 6:
        return jsonify({'error':'La contraseña debe tener al menos 6 caracteres.'}), 400
    # comprobar si email existe
    existing = db_execute('SELECT * FROM users WHERE email = ?', (email,), fetchone=True)
    if existing:
        return jsonify({'error':'El email ya está registrado.'}), 400
    password_hash = generate_password_hash(password)
    try:
        db_execute('INSERT INTO users (name,email,password_hash) VALUES (?,?,?)',
                   (name,email,password_hash), commit=True)
        return jsonify({'message':'Registro exitoso'}), 201
    except Exception as e:
        return jsonify({'error':'Error al guardar el usuario.'}), 500

# Endpoint: login
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email','').strip().lower()
    password = data.get('password','')
    if not (email and password):
        return jsonify({'error':'Email y contraseña requeridos.'}), 400
    user = db_execute('SELECT * FROM users WHERE email = ?', (email,), fetchone=True)
    if not user:
        return jsonify({'error':'Usuario no encontrado.'}), 404
    if check_password_hash(user['password_hash'], password):
        # Para proyecto inicial devolvemos ok; para producción agregar JWT/session.
        return jsonify({'message':'Autenticación correcta', 'user': {'id': user['id'], 'name': user['name'], 'email': user['email']}}), 200
    else:
        return jsonify({'error':'Contraseña incorrecta.'}), 401

# Endpoint: feedback (guarda en DB y opcionalmente envía email)
@app.route('/api/feedback', methods=['POST'])
def feedback():
    data = request.get_json()
    comentario = data.get('comentario','').strip()
    rating = int(data.get('rating') or 0)
    if not comentario:
        return jsonify({'error':'Escribe un comentario.'}), 400
    try:
        db_execute('INSERT INTO feedback (comentario,rating) VALUES (?,?)', (comentario, rating), commit=True)
        # Intentar enviar email si variables están definidas
        if EMAIL_USER and EMAIL_PASS and EMAIL_TO:
            try:
                msg = EmailMessage()
                msg['Subject'] = f'Nuevo feedback - {rating}★'
                msg['From'] = EMAIL_USER
                msg['To'] = EMAIL_TO
                msg.set_content(f'Calificación: {rating}\n\nComentario:\n{comentario}')
                # Ajusta servidor/puerto si usas otro proveedor
                with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp:
                    smtp.login(EMAIL_USER, EMAIL_PASS)
                    smtp.send_message(msg)
            except Exception as e:
                # si falla el envío, devolvemos OK pero avisamos
                return jsonify({'message':'Feedback guardado, pero fallo al enviar email.'}), 200
        return jsonify({'message':'Feedback enviado y guardado.'}), 201
    except Exception as e:
        return jsonify({'error':'Error al guardar feedback.'}), 500

if __name__ == '__main__':
    app.run(debug=True)