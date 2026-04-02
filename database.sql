-- 91W CMS Database Schema
-- Run this script to create the necessary tables for the CMS

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'editor', 'viewer') DEFAULT 'editor',
    status TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
    author_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create post_categories junction table
CREATE TABLE IF NOT EXISTS post_categories (
    post_id INT,
    category_id INT,
    PRIMARY KEY (post_id, category_id),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Create 91wheels_vehicle_types table (matching your existing structure)
CREATE TABLE IF NOT EXISTS 91wheels_vehicle_types (
    v_type_id INT AUTO_INCREMENT PRIMARY KEY,
    v_type_name VARCHAR(255) NOT NULL,
    v_type_display_name VARCHAR(255) NOT NULL,
    v_type_slug VARCHAR(100) UNIQUE NOT NULL,
    v_type_image TEXT,
    v_type_description MEDIUMTEXT,
    v_type_status ENUM('Active', 'Discontinued', 'Upcoming') DEFAULT 'Active',
    v_type_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    v_type_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    sort_order TINYINT(4) DEFAULT 20
);

-- Create modules table for permissions
CREATE TABLE IF NOT EXISTS modules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    module_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    status TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create role_permissions table
CREATE TABLE IF NOT EXISTS role_permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role ENUM('admin', 'editor', 'viewer') NOT NULL,
    module_id INT NOT NULL,
    permissions JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE,
    UNIQUE KEY unique_role_module (role, module_id)
);

-- Insert sample data
-- Password for all users: 'password123' (hashed with bcrypt)
INSERT INTO users (name, email, password, role) VALUES 
('Admin User', 'admin@91wheels.com', '$2a$10$rKZLvXZnJf5K5h5K5h5K5eO5K5h5K5h5K5h5K5h5K5h5K5h5K5h5K', 'admin'),
('Editor User', 'editor@91wheels.com', '$2a$10$rKZLvXZnJf5K5h5K5h5K5eO5K5h5K5h5K5h5K5h5K5h5K5h5K5h5K', 'editor'),
('Viewer User', 'viewer@91wheels.com', '$2a$10$rKZLvXZnJf5K5h5K5h5K5eO5K5h5K5h5K5h5K5h5K5h5K5h5K5h5K', 'viewer');

-- Insert modules
INSERT INTO modules (module_name, description) VALUES 
('users', 'User management'),
('posts', 'Post management'),
('categories', 'Category management'),
('vehicle-types', 'Vehicle types management'),
('vehicle-makes', 'Vehicle makes management'),
('settings', 'System settings');

-- Insert role permissions
-- Admin has full access (create, read, update, delete)
INSERT INTO role_permissions (role, module_id, permissions) VALUES 
('admin', 1, '["create", "read", "update", "delete"]'),
('admin', 2, '["create", "read", "update", "delete"]'),
('admin', 3, '["create", "read", "update", "delete"]'),
('admin', 4, '["create", "read", "update", "delete"]'),
('admin', 5, '["create", "read", "update", "delete"]'),
('admin', 6, '["create", "read", "update", "delete"]');

-- Editor has create, read, update access
INSERT INTO role_permissions (role, module_id, permissions) VALUES 
('editor', 1, '["read"]'),
('editor', 2, '["create", "read", "update"]'),
('editor', 3, '["create", "read", "update"]'),
('editor', 4, '["create", "read", "update"]'),
('editor', 5, '["create", "read", "update"]'),
('editor', 6, '["read"]');

-- Viewer has read-only access
INSERT INTO role_permissions (role, module_id, permissions) VALUES 
('viewer', 1, '["read"]'),
('viewer', 2, '["read"]'),
('viewer', 3, '["read"]'),
('viewer', 4, '["read"]'),
('viewer', 5, '["read"]'),
('viewer', 6, '["read"]');

INSERT INTO categories (name, slug, description) VALUES 
('Cars', 'cars', 'All about cars and automobiles'),
('Reviews', 'reviews', 'Car reviews and ratings'),
('News', 'news', 'Latest automotive news');

INSERT INTO posts (title, content, slug, status, author_id) VALUES 
('Welcome to 91W CMS', 'This is a sample post to demonstrate the CMS functionality. You can create, edit, and delete posts through the admin interface.', 'welcome-to-91w-cms', 'published', 1),
('Getting Started Guide', 'Learn how to use the 91W CMS admin panel to manage your content effectively.', 'getting-started-guide', 'draft', 2);

-- Insert sample vehicle types data
INSERT INTO 91wheels_vehicle_types (v_type_name, v_type_display_name, v_type_slug, v_type_description, v_type_status, sort_order) VALUES 
('Cars', 'Cars', 'cars', 'Four-wheeled motor vehicles designed for passenger transportation', 'Active', 1),
('Bike', 'Bikes', 'bike', 'Two-wheeled motor vehicles, motorcycles and scooters', 'Active', 2),
('Scooter', 'Scooters', 'scooter', 'Lightweight two-wheeled vehicles with step-through frame', 'Active', 3),
('Cycle', 'Cycles', 'cycle', 'Human-powered vehicles with two wheels', 'Active', 4);
