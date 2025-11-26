CREATE DATABASE mentorize CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'mentorize'@'localhost' IDENTIFIED BY 'senha';
GRANT ALL PRIVILEGES ON mentorize.* TO 'mentorize'@'localhost';
FLUSH PRIVILEGES;
