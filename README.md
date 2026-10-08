# Pflanziversum – Plant Web Shop

A web shop for house plants with separate areas for customers and
employees. Built as a group project of four students for the course
*Internettechnologien* (summer semester 2025, Hochschule Bremen).

The user interface is in German.

## Features

**Customers**
- Browse the product list and product details with care information
- See a live "only a few left" notice (Socket.IO) on a product page as
  soon as an order drops that product's stock to 5 or less
- Add products to the cart, change quantities and check out
- View their own orders and profile

**Employees**
- Create, edit and delete products
- Edit customers and orders
- See a change log of every edit to products, customers and orders

## Tech stack

| Layer | Technology |
| --- | --- |
| Frontend | Angular 19 (standalone components, server-side rendering) |
| Backend | Node.js, Express, express-session |
| Database | MySQL (via `mysql2`) |
| Live updates | Socket.IO |

The data model is documented in the [ER diagram](docs/er-diagram.pdf).

## Team

| Member | Built |
| --- | --- |
| Sophia | Navigation, login, multi-user sessions, footer |
| Kim | Employee area: product, customer and order management |
| Rumeysa | Product list and product details, live stock notice |
| Frieda | Customer area: profile, cart, order history |

## Structure

```
.
├── docs/
│   └── er-diagram.pdf       # ER diagram of the database
├── mysqlScript.sql          # Database schema, triggers and demo data
├── src/
│   ├── server.ts            # Express server: REST API (/api/...) and SSR
│   ├── app/
│   │   ├── products/        # Product list and detail pages
│   │   ├── shared/          # Navigation and footer
│   │   ├── user/
│   │   │   ├── customer-dashboard/   # Cart, orders, profile
│   │   │   ├── employee-dashboard/   # Product/customer/order admin, logs
│   │   │   └── login/
│   │   ├── auth.service.ts
│   │   └── socket.service.ts
│   ├── assets/              # Product images and icons
│   └── testing/             # Shared providers for the unit tests
└── angular.json
```

## Setup

Requirements: Node.js 18.19 or newer and a MySQL server.

1. Install the dependencies:

   ```bash
   npm ci
   ```

2. Create a database and a user, then load the schema and demo data:

   ```sql
   CREATE DATABASE webshop CHARACTER SET utf8mb4;
   CREATE USER 'webshop'@'localhost' IDENTIFIED BY '<choose a password>';
   GRANT ALL ON webshop.* TO 'webshop'@'localhost';
   ```

   ```bash
   mysql -u webshop -p --default-character-set=utf8mb4 webshop < mysqlScript.sql
   ```

3. Set the environment variables. The server refuses to start if a
   required one is missing.

   | Variable | Required | Default | Meaning |
   | --- | --- | --- | --- |
   | `DB_NAME` | yes | | Database name |
   | `DB_USER` | yes | | Database user |
   | `DB_PASSWORD` | yes | | Database password |
   | `SESSION_SECRET` | yes | | Secret used to sign the session cookie |
   | `DB_HOST` | no | `localhost` | Database host |
   | `DB_PORT` | no | `3306` | Database port |
   | `PORT` | no | `4000` | Port of the web server |

## Run

```bash
npm run build
npm run serve:ssr:project
```

PowerShell example with all required variables:

```powershell
$env:DB_NAME = "webshop"; $env:DB_USER = "webshop"; $env:DB_PASSWORD = "<password>"
$env:SESSION_SECRET = "<long random string>"
npm run serve:ssr:project
```

The shop then runs at <http://localhost:4000>. Keep the default port:
the live stock notifications connect to port 4000.

### Demo accounts

`mysqlScript.sql` creates demo users. The password is the user's ID.

| Role | E-mail | Password |
| --- | --- | --- |
| Customer | `anna.mueller@example.com` | `1` |
| Employee | `ines.meier@example.com` | `9` |

## Tests

The unit tests run with Karma in Chrome:

```bash
npm test -- --watch=false
```

HTTP requests go to Angular's test backend (`src/testing/test-providers.ts`),
so no server or database is needed.

## Known limitations

This is a course project, not production software:

- Passwords are stored and compared in plain text.
- The session cookie is not marked `secure`, so it also works over plain HTTP.
- The unit tests only check that each component and service can be
  created. They do not cover the shop logic or the REST API.
