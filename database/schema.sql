-- Reference schema for MySQL 8+ (Hibernate can create/update tables via ddl-auto; use this for manual DBA review.)
-- Charset: utf8mb4

CREATE DATABASE IF NOT EXISTS hospital_business
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE hospital_business;

-- Tables are created by JPA entities; relationships:
-- users 1:1 customer_profiles (optional, typically for CUSTOMER role)
-- customer_orders n:1 users (customer)
-- order_items n:1 customer_orders, n:1 products
-- invoices 1:1 customer_orders
