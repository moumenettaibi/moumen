import sqlite3
from werkzeug.security import generate_password_hash

# Connect to the database
connection = sqlite3.connect('database.db')

# Create tables
with open('schema.sql') as f:
    connection.executescript(f.read())

cursor = connection.cursor()

# Add sample blog post
cursor.execute("INSERT INTO posts (title, content) VALUES (?, ?)",
               ('Welcome to Flask Blog', 'This is your first blog post. Edit or delete it to get started!')
               )

# Create admin user
admin_username = 'admin'
admin_password = 'admin123'

# Fix: Use proper hash method format
hashed_password = generate_password_hash(admin_password, method='pbkdf2:sha256:600000')
# Or alternatively: generate_password_hash(admin_password, method='scrypt')

cursor.execute("INSERT INTO users (username, password, is_admin) VALUES (?, ?, ?)",
               (admin_username, hashed_password, 1))

print(f"Admin user created with username: {admin_username} and password: {admin_password}")

import sqlite3

connection = sqlite3.connect('database.db')

with open('schema.sql') as f:
    connection.executescript(f.read())

connection.commit()
connection.close()

print("Database initialized successfully!")

