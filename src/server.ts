import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine, isMainModule } from '@angular/ssr/node';
import express from 'express';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import bootstrap from './main.server';
import { createConnection, RowDataPacket } from 'mysql2';
import session from 'express-session';

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');
const indexHtml = join(serverDistFolder, 'index.server.html');
const app = express();

type User = {
  user_id: number;
  role: string;
  first_name: string;
  last_name: string;
  email: string;
};

// Declaration Merging direkt hier:
declare module "express-session" {
  interface SessionData {
    user?: User;
  }
}

app.use(session({
  secret: 'session', 
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 
  }
}));

app.use(express.json());
const commonEngine = new CommonEngine();

const dbConfig = {
  host: "***REMOVED***",
  database: "25_IT_Gruppe5",
  user: "25_IT_Grp5",
  password: "***REMOVED***",
  ssl: { rejectUnauthorized: false }
};

app.get('/api/get-products', (req, res) => {
  console.log("Anfrage angekommen");
  const con = createConnection(dbConfig);

  con.connect(function(err){
    if(err) throw err;
    console.log("connected to db");
    con.query("SELECT * from Product", function(error,result,fields){
      //console.log(result);
      res.send(result);
      con.end(function(err){
      });
    });
  });
});


app.post('/api/cart/add', (req, res) => {
  const { customer_id, product_id, quantity, price } = req.body;

  if (!customer_id || !product_id || !quantity || !price) {
    return res.status(400).json({ message: 'Fehlende Angaben' });
  }

  const con = createConnection(dbConfig);

  con.connect(err => {
    if (err) {
      return res.status(500).json({ message: 'Datenbankverbindung fehlgeschlagen' });
    }

    con.query(
      'SELECT cart_id FROM Cart WHERE customer_id = ?',
      [customer_id],
      (err, results) => {
        if (err) {
          con.end();
          return res.status(500).json({ message: 'Fehler beim Abrufen des Warenkorbs' });
        }

        const carts = results as RowDataPacket[];

        if (carts.length === 0) {
          con.end();
          return res.status(404).json({ message: 'Kein Warenkorb gefunden' });
        }

        const cart_id = carts[0]['cart_id'];
        const unit_price = price / quantity;

        con.query(
          'SELECT quantity FROM Cart_Item WHERE cart_id = ? AND product_id = ?',
          [cart_id, product_id],
          (err, itemResult) => {
            if (err) {
              con.end();
              return res.status(500).json({ message: 'Fehler beim Prüfen des Warenkorbs' });
            }

            const items = itemResult as RowDataPacket[];

            if (items.length > 0) {
              const existingQuantity = items[0]['quantity'];
              const newQuantity = existingQuantity + quantity;
              const newTotalPrice = newQuantity * unit_price;

              con.query(
                'UPDATE Cart_Item SET quantity = ?, price = ? WHERE cart_id = ? AND product_id = ?',
                [newQuantity, newTotalPrice, cart_id, product_id],
                err => {
                  if (err) {
                    con.end();
                    return res.status(500).json({ message: 'Fehler beim Aktualisieren des Artikels' });
                  }
                  return updateCartTotal(con, cart_id, res);
                }
              );
              return; // wichtig, damit callback endet
            } else {
              con.query(
                'INSERT INTO Cart_Item (cart_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
                [cart_id, product_id, quantity, price],
                err => {
                  if (err) {
                    con.end();
                    return res.status(500).json({ message: 'Fehler beim Hinzufügen des Artikels' });
                  }
                  return updateCartTotal(con, cart_id, res);
                }
              );
              return;
            }
          }
        );
        return;
      }
    );
    return;
  });

  return; // wichtig: Hauptfunktion gibt synchron return
});

function updateCartTotal(con: ReturnType<typeof createConnection>, cart_id: number, res: express.Response) {
  return con.query(
    `UPDATE Cart
     SET total_price = (
       SELECT IFNULL(SUM(price), 0)
       FROM Cart_Item
       WHERE cart_id = ?
     )
     WHERE cart_id = ?`,
    [cart_id, cart_id],
    err => {
      con.end();

      if (err) {
        return res.status(500).json({ message: 'Fehler beim Aktualisieren des Gesamtpreises' });
      }

      return res.status(201).json({ message: 'Artikel hinzugefügt oder aktualisiert' });
    }
  );
}

app.get('/api/get-cart', (req, res) => {
  const sessionUser = req.session.user;

  if (!sessionUser || sessionUser.role !== 'customer') {
    return res.status(401).json({ message: 'Nicht autorisiert' });
  }

  const customer_id = sessionUser.user_id;
  const con = createConnection(dbConfig);

  con.connect(err => {
    if (err) {
      return res.status(500).json({ message: 'Datenbankverbindung fehlgeschlagen' });
    }


    return con.query(
      'SELECT cart_id FROM Cart WHERE customer_id = ?',
      [customer_id],
      (err, results) => {
        if (err) {
          con.end();
          return res.status(500).json({ message: 'Fehler beim Abrufen des Warenkorbs' });
        }

        const cartId = (results as RowDataPacket[])[0]['cart_id'];
        console.log("Verwende cartId:", cartId);

        const sql = `
          SELECT 
            ci.product_id,
            p.name,
            p.description,
            p.image,
            ci.quantity,
            ci.price
          FROM Cart_Item ci
          LEFT JOIN Product p ON ci.product_id = p.product_id
          WHERE ci.cart_id = ?
        `;

        console.log("SQL Query wird ausgeführt mit cartId:", cartId);


        return con.query(sql, [cartId], (err, items) => {
  if (err) {
    console.error("SQL-Fehler bei get-cart:", err);
    con.end();
    return res.status(500).json({ message: 'Fehler beim Laden der Warenkorbdaten' });
  }
  
  console.log("Items aus DB:", items);
  con.end();
  res.json({
    cart_id: cartId,
    items
  });
        return;
        });
      }
    );
  });
  return;
});


app.get('/api/get-customers', (req, res) => {
  const con = createConnection(dbConfig);
  con.connect(err => {
    if(err) {
      res.status(500).send("DB connection error");
      return;
    }
    con.query("SELECT * FROM Customer", (error, results) => {
      if(error) {
        res.status(500).send(error);
      } else {
        res.send(results);
      }
      con.end();
    });
  });
});

app.get('/api/get-orders', (req, res) => {
  const con = createConnection(dbConfig);
  con.connect(err => {
    if(err) {
      res.status(500).send("DB connection error");
      return;
    }
    con.query("SELECT * FROM Customer_Order", (error, results) => {
      if(error) {
        res.status(500).send(error);
      } else {
        res.send(results);
      }
      con.end();
    });
  });
});

app.post('/api/login', (req, res) => {
  console.log("Anfrage angekommen");
  const con = createConnection(dbConfig);

  const { email, password } = req.body;
  const sql = `
    SELECT 
      u.user_id,
      u.first_name,
      u.last_name,
      u.password,
      u.email,
      CASE 
        WHEN c.customer_id IS NOT NULL THEN 'customer'
        WHEN e.employee_id IS NOT NULL THEN 'employee'
        ELSE 'unknown'
      END AS role
    FROM User u
    LEFT JOIN Customer c ON u.user_id = c.customer_id
    LEFT JOIN Employee e ON u.user_id = e.employee_id
    WHERE u.email = ? AND u.password = ?
    LIMIT 1
  `;

  con.query(
    sql,
    [email, password],
    (error, results) => {
      if (error) {
        res.status(500).send(error);
        con.end();
        return;
      }
      const rows = results as any[];
      if (rows.length === 1 && rows[0].role !== 'unknown') {
        // Session setzen!
        req.session.user = {
          user_id: rows[0].user_id,
          role: rows[0].role,
          first_name: rows[0].first_name,
          last_name: rows[0].last_name,
          email: rows[0].email
        };
        res.json({ 
          user_id: rows[0].user_id,
          role: rows[0].role,
          first_name: rows[0].first_name,
          last_name: rows[0].last_name
        });
      } else {
        res.status(401).json({ message: 'Falsche Zugangsdaten' });
      }
      con.end();
    }
  );
});

app.get('/api/user-details', (req, res) => {
  if (!req.session.user) {
    res.status(401).json({ message: 'Nicht eingeloggt' });
    return;
  }

  const userId = req.session.user.user_id;
  const con = createConnection(dbConfig);

  const sql = `
    SELECT 
      u.user_id,
      u.first_name,
      u.last_name,
      u.email,
      u.address_id,
      a.street,
      a.house_number,
      a.zipcode,
      a.country,
      a.city,
      e.monthly_salary,
      e.role AS employee_role,
      CASE 
        WHEN c.customer_id IS NOT NULL THEN 'customer'
        WHEN e.employee_id IS NOT NULL THEN 'employee'
        ELSE 'unknown'
      END AS role
    FROM User u
    LEFT JOIN Address a ON u.address_id = a.address_id
    LEFT JOIN Customer c ON u.user_id = c.customer_id
    LEFT JOIN Employee e ON u.user_id = e.employee_id
    WHERE u.user_id = ?
    LIMIT 1
  `;

  con.query(sql, [userId], (error, results) => {
    con.end();

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    const rows = results as any[];

    if (rows.length === 0) {
      res.status(404).json({ message: 'User nicht gefunden' });
      return;
    }

    const row = rows[0];

    const userDetails = {
      user_id: row.user_id,
      first_name: row.first_name,
      last_name: row.last_name,
      email: row.email,
      role: row.role,
      address: row.address_id ? {
        street: row.street,
        house_number: row.house_number,
        zipcode: row.zipcode,
        country: row.country,
        city: row.city,
      } : null,
      employee_data: row.employee_role ? {
        monthly_salary: row.monthly_salary,
        role: row.employee_role,
      } : null
    };

    res.json(userDetails);
  });
});

app.get('/api/me', (req, res) => {
  if (req.session.user) {
    res.json({ user: req.session.user });
  } else {
    res.status(401).json({ message: 'Nicht eingeloggt' });
  }
});

app.post('/api/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

/**
 * Serve static files from /browser
 */
app.get(
  '**',
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: 'index.html'
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.get('**', (req, res, next) => {
  const { protocol, originalUrl, baseUrl, headers } = req;

  commonEngine
    .render({
      bootstrap,
      documentFilePath: indexHtml,
      url: `${protocol}://${headers.host}${originalUrl}`,
      publicPath: browserDistFolder,
      providers: [{ provide: APP_BASE_HREF, useValue: baseUrl }],
    })
    .then((html) => res.send(html))
    .catch((err) => next(err));
});

/**
 * Start the server if this module is the main entry point.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

export default app;
