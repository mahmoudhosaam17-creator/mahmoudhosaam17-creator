-- script.sql: Creates FoodTruck schema tables (PostgreSQL)
CREATE SCHEMA IF NOT EXISTS "FoodTruck";

CREATE TABLE IF NOT EXISTS "FoodTruck"."Users" (
  "userId" serial PRIMARY KEY,
  "name" text NOT NULL,
  "email" text NOT NULL UNIQUE,
  "password" text NOT NULL,
  "role" text DEFAULT 'customer',
  "birthDate" date DEFAULT CURRENT_DATE,
  "createdAt" timestamp DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "FoodTruck"."Trucks" (
  "truckId" serial PRIMARY KEY,
  "truckName" text NOT NULL UNIQUE,
  "truckLogo" text,
  "ownerId" integer REFERENCES "FoodTruck"."Users"("userId"),
  "truckStatus" text DEFAULT 'available',
  "orderStatus" text DEFAULT 'available',
  "createdAt" timestamp DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "FoodTruck"."MenuItems" (
  "itemId" serial PRIMARY KEY,
  "truckId" integer REFERENCES "FoodTruck"."Trucks"("truckId"),
  "name" text NOT NULL,
  "description" text,
  "price" numeric(10,2) NOT NULL,
  "category" text NOT NULL,
  "status" text DEFAULT 'available',
  "createdAt" timestamp DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "FoodTruck"."Orders" (
  "orderId" serial PRIMARY KEY,
  "userId" integer REFERENCES "FoodTruck"."Users"("userId"),
  "truckId" integer REFERENCES "FoodTruck"."Trucks"("truckId"),
  "orderStatus" text NOT NULL,
  "totalPrice" numeric(10,2) NOT NULL,
  "scheduledPickupTime" timestamp,
  "estimatedEarliestPickup" timestamp,
  "createdAt" timestamp DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "FoodTruck"."OrderItems" (
  "orderItemId" serial PRIMARY KEY,
  "orderId" integer REFERENCES "FoodTruck"."Orders"("orderId"),
  "itemId" integer REFERENCES "FoodTruck"."MenuItems"("itemId"),
  "quantity" integer NOT NULL,
  "price" numeric(10,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS "FoodTruck"."Carts" (
  "cartId" serial PRIMARY KEY,
  "userId" integer REFERENCES "FoodTruck"."Users"("userId"),
  "itemId" integer REFERENCES "FoodTruck"."MenuItems"("itemId"),
  "quantity" integer NOT NULL,
  "price" numeric(10,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS "FoodTruck"."Sessions" (
  "id" serial PRIMARY KEY,
  "userId" integer REFERENCES "FoodTruck"."Users"("userId"),
  "token" text NOT NULL,
  "expiresAt" timestamp DEFAULT CURRENT_TIMESTAMP
);
