DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS users;

CREATE TABLE posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    image_path TEXT
);

CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    is_admin INTEGER NOT NULL DEFAULT 0
);

-- Create an admin user (password is 'admin')
INSERT INTO users (username, password, is_admin)
VALUES ('admin', 'pbkdf2:sha256:150000$Yf99CZ5c$37eef22f551086307f80c3c95c12f4c22a6d0cbf5a4c67a5993df1db8ceceb9f', 1);
