# GIU FoodTruck Backend - Milestone 3 (Template)

This project folder is prepared for Milestone 3 backend tasks for the GIU Food-Truck System.
It includes table creation script, a sample Express/Knex backend with all required endpoints implemented as templates, and instructions to run and adapt locally.

**Source PDF used to prepare this template:** Milestone 3 specification. (See connectors/script.sql and README sections for direct mapping.)

## Quick start
1. Copy `.env.example` to `.env` and set your Postgres connection credentials.
2. Run `npm install` in `milestoneBackend_project`.
3. Execute the SQL script in `connectors/script.sql` against your Postgres DB (e.g. with pgAdmin) to create the FoodTruck schema and tables.
4. Run `npm run server` to start the server.
5. Use headers `Authorization: Bearer test-truckowner` or `Authorization: Bearer test-customer` to simulate authenticated users for testing endpoints.

## Files created
- server.js (express app wiring)
- knexfile.js
- package.json
- .env.example
- connectors/script.sql  <- schema create script
- utils/session.js  <- getUser() placeholder
- controllers/ (menuItemController.js, trucksController.js, cartController.js, orderController.js)
- routes/ (menuItem.js, trucks.js, cart.js, order.js)
- README.md (this file)

## Where to paste the Milestone 3 documentation (per PDF)
Paste the milestone documentation in `milestoneBackend/README.md` (this README) and include `connectors/script.sql` inside `milestoneBackend/connectors/` as required by the assignment.

-- Prepared using the project PDF specification. fileciteturn0file0
