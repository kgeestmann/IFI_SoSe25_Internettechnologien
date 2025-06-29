import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine, isMainModule } from '@angular/ssr/node';
import express from 'express';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import bootstrap from './main.server';
import { createConnection } from 'mysql2';
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
      c.billing_address_id,
      c.shipping_address_id,
      cb.street AS billing_street,
      cb.house_number AS billing_house_number,
      cb.zipcode AS billing_zipcode,
      cb.country AS billing_country,
      cb.city AS billing_city,
      cs.street AS shipping_street,
      cs.house_number AS shipping_house_number,
      cs.zipcode AS shipping_zipcode,
      cs.country AS shipping_country,
      cs.city AS shipping_city,
      e.monthly_salary,
      e.role AS employee_role,
      ea.street AS employee_street,
      ea.house_number AS employee_house_number,
      ea.zipcode AS employee_zipcode,
      ea.country AS employee_country,
      ea.city AS employee_city,
      CASE 
        WHEN c.customer_id IS NOT NULL THEN 'customer'
        WHEN e.employee_id IS NOT NULL THEN 'employee'
        ELSE 'unknown'
      END AS role
    FROM User u
    LEFT JOIN Customer c ON u.user_id = c.customer_id
    LEFT JOIN Address cb ON c.billing_address_id = cb.address_id
    LEFT JOIN Address cs ON c.shipping_address_id = cs.address_id
    LEFT JOIN Employee e ON u.user_id = e.employee_id
    LEFT JOIN Address ea ON e.address_id = ea.address_id
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
      billing_address: row.billing_address_id ? {
        street: row.billing_street,
        house_number: row.billing_house_number,
        zipcode: row.billing_zipcode,
        country: row.billing_country,
        city: row.billing_city,
      } : null,
      shipping_address: row.shipping_address_id ? {
        street: row.shipping_street,
        house_number: row.shipping_house_number,
        zipcode: row.shipping_zipcode,
        country: row.shipping_country,
        city: row.shipping_city,
      } : null,
      employee_data: row.employee_role ? {
        monthly_salary: row.monthly_salary,
        role: row.employee_role,
        address: row.employee_street ? {
          street: row.employee_street,
          house_number: row.employee_house_number,
          zipcode: row.employee_zipcode,
          country: row.employee_country,
          city: row.employee_city,
        } : null
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
