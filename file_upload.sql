CREATE DATABASE file_upload;
USE file_upload;

CREATE TABLE files (
    id INT AUTO_INCREMENT PRIMARY KEY,
    filename VARCHAR(255),
    originalname VARCHAR(255),
    mimetype VARCHAR(255),
    size INT
);
