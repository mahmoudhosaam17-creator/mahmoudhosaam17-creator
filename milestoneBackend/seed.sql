-- =========================
-- Seed data for FoodTruck DB
-- =========================

-- USERS
INSERT INTO "FoodTruck"."Users" (name, email, password, role, birthDate)
VALUES
('Mahmoud Customer', 'customer@test.com', 'password123', 'customer', '2001-03-05'),
('Omar Owner', 'owner@test.com', 'password123', 'truckOwner', '1998-06-11'),
('Sara Customer', 'sara@test.com', 'password123', 'customer', '2000-08-20'),
('Ali Owner', 'aliowner@test.com', 'password123', 'truckOwner', '1995-02-14');

-- TRUCKS
INSERT INTO "FoodTruck"."Trucks" (truckName, truckLogo, ownerId, truckStatus, orderStatus)
VALUES
('Omar Burgers', 'https://example.com/logo1.png', 6, 'available', 'available'),
('Ali Tacos', 'https://example.com/logo2.png', 8, 'available', 'available');

-- MENU ITEMS
INSERT INTO "FoodTruck"."MenuItems" (truckId, name, description, price, category, status)
VALUES
(6, 'Classic Burger', 'Beef patty, cheese, tomato, lettuce', 120.00, 'Main', 'available'),
(6, 'Chicken Burger', 'Crispy chicken breast, mayo, lettuce', 110.00, 'Main', 'available'),
(6, 'Fries', 'Golden fries', 40.00, 'Sides', 'available'),
(6, 'Cola', 'Cold soft drink', 25.00, 'Drinks', 'available'),
(7, 'Taco Al Pastor', 'Marinated pork taco with pineapple', 90.00, 'Main', 'available'),
(7, 'Beef Taco', 'Beef taco with salsa', 95.00, 'Main', 'available'),
(7, 'Nachos', 'Cheesy nachos', 70.00, 'Sides', 'available');

-- CARTS
INSERT INTO "FoodTruck"."Carts" (userId, itemId, quantity, price)
VALUES
(5, 1, 1, 120.00),
(5, 3, 2, 40.00);

-- ORDERS
INSERT INTO "FoodTruck"."Orders"
(userId, truckId, orderStatus, totalPrice, scheduledPickupTime, estimatedReadyTime)
VALUES
(5, 6, 'pending', 200.00, '2025-12-15 14:30:00', '2025-12-15 14:10:00'),
(7, 7, 'completed', 110.00, '2025-11-10 12:00:00', '2025-11-10 11:30:00'),
(5, 6, 'completed', 160.00, '2025-12-10 15:00:00', '2025-12-10 14:40:00'),
(7, 7, 'pending', 90.00, '2025-12-20 18:00:00', '2025-12-20 17:40:00');

-- ORDER ITEMS
INSERT INTO "FoodTruck"."OrderItems" (orderId, itemId, quantity, price)
VALUES
(1, 1, 1, 120.00),
(1, 3, 2, 40.00),
(2, 5, 1, 90.00),
(3, 2, 1, 110.00);
