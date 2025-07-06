import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine, isMainModule } from '@angular/ssr/node';
import express from 'express';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import bootstrap from './main.server';
import { createConnection, ResultSetHeader, RowDataPacket } from 'mysql2';
import session from 'express-session';
import { OkPacket } from 'mysql';

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

app.post('/api/products', async (req, res) => {
  const user = req.session.user;

  // Nur Mitarbeiter dürfen Produkte erstellen
  if (!user || user.role !== 'employee') {
    return res.status(403).json({ message: 'Nur Mitarbeiter dürfen Produkte erstellen' });
  }

  const { name, description, price, stock_quantity, image } = req.body;

  // Pflichtfelder prüfen
  if (!name || price === undefined || stock_quantity === undefined || !description || !image) {
    return res.status(400).json({ message: 'Fehlende Pflichtfelder (name, price, stock_quantity, description, image)' });
  }

  const con = createConnection(dbConfig).promise();

  try {
    await con.connect();

    // Nur Produkt einfügen, kein Logging mehr
    const [insertResult] = await con.query(
      'INSERT INTO Product (name, description, price, stock_quantity, image) VALUES (?, ?, ?, ?, ?)',
      [name, description, price, stock_quantity, image]
    );

    const insertedId = (insertResult as OkPacket).insertId;

    await con.end();

    return res.status(201).json({ message: 'Produkt erfolgreich erstellt', product_id: insertedId });
  } catch (error: any) {
    await con.end();
    console.error('Fehler beim Einfügen des Produkts:', error);
    return res.status(500).json({ message: 'Fehler beim Erstellen des Produkts', error: error.message });
  }
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

              if (newQuantity <= 0) {
                con.query(
                  'DELETE FROM Cart_Item WHERE cart_id = ? AND product_id = ?',
                  [cart_id, product_id],
                  err => {
                    if (err) {
                      con.end();
                      return res.status(500).json({ message: 'Fehler beim Löschen des Artikels' });
                    }
                    return updateCartTotal(con, cart_id, res);
                  }
                );
                return;
              }

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
              return;
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

  return;
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

app.post('/api/cart/clear', (req, res) => {
  const { customer_id } = req.body;

  if (!customer_id) {
    return res.status(400).json({ message: 'Fehlende customer_id' });
  }

  const con = createConnection(dbConfig);

  con.connect(err => {
    if (err) {
      return res.status(500).json({ message: 'Datenbankverbindung fehlgeschlagen' });
    }

    // 1. Warenkorb-ID abrufen (SELECT liefert Array)
    return con.query(
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

        // 2. Alle Artikel aus Cart_Item löschen (DELETE liefert OkPacket, kein Array!)
        return con.query(
          'DELETE FROM Cart_Item WHERE cart_id = ?',
          [cart_id],
          (err, result) => {
            if (err) {
              con.end();
              return res.status(500).json({ message: 'Fehler beim Leeren des Warenkorbs' });
            }

            const deleteResult = result as OkPacket;

            if (deleteResult.affectedRows === 0) {
              // Warenkorb war schon leer, kein Problem
              console.log('Warenkorb war bereits leer');
            }

            // 3. Gesamtpreis im Warenkorb auf 0 setzen (UPDATE liefert OkPacket)
            return con.query(
              'UPDATE Cart SET total_price = 0 WHERE cart_id = ?',
              [cart_id],
              (err, result) => {
                con.end();

                if (err) {
                  return res.status(500).json({ message: 'Fehler beim Aktualisieren des Gesamtpreises' });
                }

                return res.status(200).json({ message: 'Warenkorb geleert' });
              }
            );
            return;
          }
        );
        return;
      }
    );
    return;
  });
  return;
});

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

        const sql = `
          SELECT 
            ci.product_id,
            p.name,
            p.description,
            p.image,
            ci.quantity,
            ci.price,
            c.total_price
          FROM Cart_Item ci
          LEFT JOIN Product p ON ci.product_id = p.product_id
          INNER JOIN Cart c ON ci.cart_id = c.cart_id
          WHERE ci.cart_id = ?
        `;

        return con.query(sql, [cartId], (err, results) => {
  if (err) {
    con.end();
    return res.status(500).json({ message: 'Fehler beim Laden der Warenkorbdaten' });
  }

  const items = results as RowDataPacket[];

  const total_price = items.length > 0 ? items[0]['total_price'] : 0;  

  con.end();
  res.json({
    cart_id: cartId,
    items,
    total_price
    });
        return;
        });
      }
    );
  });
  return;
});

app.post('/api/cart/checkout', (req, res) => {
  const user = req.session.user;
  if (!user || user.role !== 'customer') {
    return res.status(401).json({ message: 'Nicht autorisiert' });
  }

  const con = createConnection(dbConfig);

  con.connect(err => {
    if (err) return res.status(500).json({ message: 'DB‑Verbindung fehlgeschlagen' });

    con.beginTransaction(err => {
      if (err) { con.end(); return res.status(500).json({ message: 'Transaktionsfehler' }); }

      /* 1. Warenkorb holen */
      con.query(
        `SELECT cart_id, total_price
           FROM Cart
          WHERE customer_id = ?`,
        [user.user_id],
        (err, results) => {
          if (err) return rollback('Fehler beim Lesen des Warenkorbs');

          const cartRows = results as RowDataPacket[];
          if (!cartRows.length || cartRows[0]['total_price'] === 0) {
            return rollback('Warenkorb leer', 400);
          }

          const cart_id     = cartRows[0]['cart_id'];
          const total_price = cartRows[0]['total_price'];

          /* 2. Bestellungskopf einfügen */
          con.query(
            `INSERT INTO Customer_Order
               (customer_id, date, delivery_status, total_price, payment_method)
             VALUES (?, CURDATE(), 'open', ?, 'invoice')`,
            [user.user_id, total_price],
            (err, results) => {
              if (err) return rollback('Fehler beim Anlegen der Bestellung');

              const order_id = (results as ResultSetHeader).insertId;

              /* 3. Positionen kopieren in Order_Item */
              con.query(
                `INSERT INTO Order_Item
                   (order_id, product_id, quantity, price)
                 SELECT ?, product_id, quantity, price
                   FROM Cart_Item
                  WHERE cart_id = ?`,
                [order_id, cart_id],
                err => {
                  if (err) return rollback('Fehler beim Kopieren der Positionen');

                  /* 4. Warenkorb leeren */
                  con.query(
                    `DELETE FROM Cart_Item WHERE cart_id = ?`,
                    [cart_id],
                    err => {
                      if (err) return rollback('Fehler beim Leeren des Warenkorbs');

                      con.query(
                        `UPDATE Cart SET total_price = 0 WHERE cart_id = ?`,
                        [cart_id],
                        err => {
                          if (err) return rollback('Fehler beim Zurücksetzen des Warenkorbs');

                          /* 5. Commit und Antwort */
                          con.commit(err => {
                            con.end();
                            if (err) return res.status(500).json({ message: 'Commit‑Fehler' });

                            return res.status(201).json({
                              message: 'Bestellung erfolgreich erstellt',
                              order_id
                            });
                          });
                        }
                      );
                    }
                  );
                }
              );
            }
          );
        }
      );

      function rollback(msg: string, code = 500) {
        con.rollback(() => {
          con.end();
          res.status(code).json({ message: msg });
        });
      }
      return;
    });
    return;
  });
  return;
});


app.get('/api/get-product/:id', (req, res) => {
  const productId = req.params.id;

  const con = createConnection(dbConfig);

  con.connect(function(err) {
    if (err) {
      console.error('DB-Verbindung fehlgeschlagen:', err);
      res.status(500).send('Datenbankfehler');
      return;
    }
    console.log("connected to db");

    con.query(
      "SELECT * FROM Product WHERE product_id = ?",
      [productId],
      function (error, results, fields) {
        if (error) {
          console.error('Fehler bei der Abfrage:', error);
          res.status(500).send('Abfragefehler');
        } else {
          if (Array.isArray(results) && results.length === 0) {
            res.status(404).send('Produkt nicht gefunden');
          } else if (Array.isArray(results)) {
            res.send(results[0]);
          } else {
            res.status(500).send('Unerwartetes Ergebnis');
          }
        }
        con.end();
      }
    );

  }); 
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

app.get('/api/get-customer/:id', (req, res) => {
  const customer_id = req.params.id;
  const con = createConnection(dbConfig);
  con.connect(err => {
    if(err) {
      res.status(500).send("DB connection error");
      return;
    }
    con.query("SELECT * FROM Customer WHERE customer_id = ?",
      [customer_id],
      (error, results) => {
        if(error) {
          res.status(500).send(error);
        } else {
          if (Array.isArray(results) && results.length === 0) {
            res.status(404).send('Kunde nicht gefunden.');
          } else if (Array.isArray(results)) {
            res.send(results[0]);
          } else {
            res.status(500).send('Unerwartetes Ergebnis');
          }
        }
        con.end();
      });
  });
});

app.post('/api/edit-customer', (req, res) => {
  const { customer_id, street, house_number, zipcode, country, city } = req.body;
  if (!customer_id || !street || !house_number || !zipcode || !country || !city) {
    return res.status(400).json({ message: 'Fehlende Angaben' });
  }
  const con = createConnection(dbConfig);
  con.connect(err => {
    if (err) {
      return res.status(500).json({ message: 'Datenbankverbindung fehlgeschlagen' });
    }
    con.query(
      'UPDATE User SET address_id = ? WHERE user_id = ?', // TODO - This needs updating so it can save the customer details
      [customer_id],
      err => {
        if (err) {
          console.error('SQL Error:', err);
          con.end();
          return res.status(500).json({ message: 'Fehler beim Aktualisieren des Artikels' });
        }
        return res.status(200).json({ message: 'Bestellung erfolgreich aktualisiert.' });
      }
    );
    return;
  });
  return;
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

app.get('/api/get-order/:id', (req, res) => {
  const order_id = req.params.id;
  const con = createConnection(dbConfig);
  con.connect(err => {
    if(err) {
      res.status(500).send("DB connection error");
      return;
    }
    con.query("SELECT * FROM Customer_Order WHERE order_id = ?",
      [order_id],
      (error, results) => {
      if(error) {
        res.status(500).send(error);
      } else {
        if (Array.isArray(results) && results.length === 0) {
          res.status(404).send('Bestellung nicht gefunden');
        } else if (Array.isArray(results)) {
          res.send(results[0]);
        } else {
          res.status(500).send('Unerwartetes Ergebnis');
        }
      }
      con.end();
    });
  });
});

app.post('/api/edit-order', (req, res) => {
  const { order_id, customer_id, date, delivery_status, total_price, payment_method } = req.body;
  if (!order_id || !customer_id || !date || !delivery_status || !total_price || !payment_method) {
    return res.status(400).json({ message: 'Fehlende Angaben' });
  }
  const con = createConnection(dbConfig);
  con.connect(err => {
    if (err) {
      return res.status(500).json({ message: 'Datenbankverbindung fehlgeschlagen' });
    }
    con.query(
      'UPDATE Customer_Order SET customer_id = ?, date = ?, delivery_status = ?, total_price = ?, payment_method = ? WHERE order_id = ?',
      [customer_id, new Date(date).toISOString().split('T')[0], delivery_status, total_price, payment_method, order_id],
      err => {
        if (err) {
          console.error('SQL Error:', err);
          con.end();
          return res.status(500).json({ message: 'Fehler beim Aktualisieren des Artikels' });
        }
        return res.status(200).json({ message: 'Bestellung erfolgreich aktualisiert.' });
      }
    );
    return;
  });
  return;
});

app.get('/api/get-logs', (req, res) => {
  const con = createConnection(dbConfig);
  
  con.connect(err => {
    if (err) {
      res.status(500).send("DB connection error");
      return;
    }

    con.query("SELECT * FROM Product_Change", (error1, productLogs) => {
      if (error1) {
        con.end();
        res.status(500).send(error1);
        return;
      }

      con.query("SELECT * FROM Order_Change", (error2, orderLogs) => {
        if (error2) {
          con.end();
          res.status(500).send(error2);
          return;
        }

        con.query("SELECT * FROM User_Change", (error3, userLogs) => {
          con.end();

          if (error3) {
            res.status(500).send(error3);
          } else {
            res.json({
              products: productLogs,
              orders: orderLogs,
              users: userLogs
            });
          }
        });
      });
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
