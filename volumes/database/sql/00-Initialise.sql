/* Create the users table */

CREATE TABLE Overseer_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    permissions VARCHAR(50) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    remember_token CHAR(64),
    remember_token_expiration DATETIME,
    devices INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

/* Create the device table */

CREATE TABLE Overseer_devices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    verified VARCHAR(255),
    device_name VARCHAR(255),
    parent INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent) REFERENCES Overseer_users(id)
);