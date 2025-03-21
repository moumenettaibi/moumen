import os
import sqlite3
from flask import Flask, render_template, request, url_for, flash, redirect, abort, session, jsonify
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from functools import wraps

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key'
app.config['UPLOAD_FOLDER'] = 'static/uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max upload
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

# Create upload directory if it doesn't exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

def get_db_connection():
    conn = sqlite3.connect('database.db')
    conn.row_factory = sqlite3.Row
    return conn

def get_post(post_id):
    conn = get_db_connection()
    post = conn.execute('SELECT * FROM posts WHERE id = ?',
                        (post_id,)).fetchone()
    conn.close()
    if post is None:
        abort(404)
    post_dict = dict(post)
    if isinstance(post_dict['created'], str):
        post_dict['created'] = datetime.strptime(post_dict['created'], '%Y-%m-%d %H:%M:%S')
    return post_dict

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Admin required decorator
def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            flash('Please log in to access this page.')
            return redirect(url_for('login'))
        conn = get_db_connection()
        user = conn.execute('SELECT * FROM users WHERE id = ?',
                          (session['user_id'],)).fetchone()
        conn.close()
        if not user or not user['is_admin']:
            flash('You need admin privileges to access this page.')
            return redirect(url_for('index'))
        return f(*args, **kwargs)
    return decorated_function

@app.route('/register', methods=('GET', 'POST'))
def register():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        if not username or not password:
            flash('Username and password are required!')
        else:
            conn = get_db_connection()
            user = conn.execute('SELECT * FROM users WHERE username = ?',
                              (username,)).fetchone()
            if user:
                flash('Username already exists!')
            else:
                hashed_password = generate_password_hash(password)
                conn.execute('INSERT INTO users (username, password, is_admin) VALUES (?, ?, ?)',
                           (username, hashed_password, 0))
                conn.commit()
                conn.close()
                flash('Registration successful! Please log in.')
                return redirect(url_for('login'))
            conn.close()
    return render_template('auth/register.html')

@app.route('/login', methods=('GET', 'POST'))
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        conn = get_db_connection()
        user = conn.execute('SELECT * FROM users WHERE username = ?',
                          (username,)).fetchone()
        conn.close()
        if user and check_password_hash(user['password'], password):
            session.clear()
            session['user_id'] = user['id']
            return redirect(url_for('index'))
        flash('Incorrect username or password!')
    return render_template('auth/login.html')

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('index'))

@app.route('/')
def index():
    conn = get_db_connection()
    posts = conn.execute('SELECT * FROM posts ORDER BY created DESC').fetchall()
    post_list = []
    for post in posts:
        post_dict = dict(post)
        if isinstance(post_dict['created'], str):
            post_dict['created'] = datetime.strptime(post_dict['created'], '%Y-%m-%d %H:%M:%S')
        post_list.append(post_dict)
    conn.close()
    return render_template('blog/index.html', posts=post_list)

@app.route('/<int:post_id>')
def post(post_id):
    post = get_post(post_id)
    return render_template('blog/post.html', post=post)

@app.route('/upload', methods=['POST'])
@admin_required
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        # Add timestamp to prevent filename collisions
        filename = f"{int(datetime.now().timestamp())}_{filename}"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        return jsonify({'url': url_for('static', filename=f'uploads/{filename}')})
    
    return jsonify({'error': 'File type not allowed'}), 400

# Apply admin_required decorator to admin routes
@app.route('/create', methods=('GET', 'POST'))
@admin_required
def create():
    if request.method == 'POST':
        title = request.form['title']
        content = request.form['content']
        if not title:
            flash('Title is required!')
        else:
            conn = get_db_connection()
            conn.execute('INSERT INTO posts (title, content) VALUES (?, ?)',
                        (title, content))
            conn.commit()
            conn.close()
            return redirect(url_for('index'))
    return render_template('blog/create.html')

@app.route('/<int:id>/edit', methods=('GET', 'POST'))
@admin_required
def edit(id):
    post = get_post(id)
    if request.method == 'POST':
        title = request.form['title']
        content = request.form['content']
        if not title:
            flash('Title is required!')
        else:
            conn = get_db_connection()
            conn.execute('UPDATE posts SET title = ?, content = ?'
                        ' WHERE id = ?',
                        (title, content, id))
            conn.commit()
            conn.close()
            return redirect(url_for('index'))
    return render_template('blog/edit.html', post=post)

@app.route('/<int:id>/delete', methods=('POST',))
@admin_required
def delete(id):
    post = get_post(id)
    conn = get_db_connection()
    conn.execute('DELETE FROM posts WHERE id = ?', (id,))
    conn.commit()
    conn.close()
    flash('"{}" was successfully deleted!'.format(post['title']))
    return redirect(url_for('index'))

@app.context_processor
def inject_user():
    is_admin = False
    if 'user_id' in session:
        conn = get_db_connection()
        user = conn.execute('SELECT * FROM users WHERE id = ?',
                          (session['user_id'],)).fetchone()
        conn.close()
        if user and user['is_admin']:
            is_admin = True
    return dict(is_admin=is_admin)

# Add a template filter to handle date formatting
@app.template_filter('format_date')
def format_date(value, format='%B %d, %Y'):
    if value is None:
        return ""
    if isinstance(value, str):
        try:
            value = datetime.strptime(value, '%Y-%m-%d %H:%M:%S')
        except ValueError:
            return value
    return value.strftime(format)

if __name__ == '__main__':
    app.run(debug=True)
