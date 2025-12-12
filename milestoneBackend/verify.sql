SELECT 'users' AS table_name, COUNT(*) FROM "FoodTruck"."Users"
UNION ALL
SELECT 'trucks', COUNT(*) FROM "FoodTruck"."Trucks"
UNION ALL
SELECT 'menuitems', COUNT(*) FROM "FoodTruck"."MenuItems"
UNION ALL
SELECT 'carts', COUNT(*) FROM "FoodTruck"."Carts"
UNION ALL
SELECT 'orders', COUNT(*) FROM "FoodTruck"."Orders"
UNION ALL
SELECT 'orderitems', COUNT(*) FROM "FoodTruck"."OrderItems";
