# create_db.py
from sqlalchemy import create_engine, text
import os

DB_PATH = os.path.join('instance', 'learnbook.db')
os.makedirs('instance', exist_ok=True)
engine = create_engine(f"sqlite:///{DB_PATH}")

with engine.connect() as conn:
    conn.execute(text(open('schema.sql').read()))
    conn.commit()

print("Base de datos creada en", DB_PATH)