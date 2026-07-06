-- Run manually against the existing `his` database (no migration runner in this repo).
-- Adds a notifications inbox: customer notifications are per-user (user_id set),
-- admin notifications are a shared broadcast inbox (user_id NULL, audience='admin').

CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    audience ENUM('customer', 'admin') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message VARCHAR(500) NOT NULL,
    link VARCHAR(255) NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
