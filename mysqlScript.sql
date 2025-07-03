-- Optional: Vorherige Tabellen löschen 
DROP TABLE IF EXISTS Cart_Item;
DROP TABLE IF EXISTS Order_Item;
DROP TABLE IF EXISTS Product_Change;
DROP TABLE IF EXISTS Invoice;
DROP TABLE IF EXISTS Customer_Order;
DROP TABLE IF EXISTS Cart;
DROP TABLE IF EXISTS Product;
DROP TABLE IF EXISTS Employee;
DROP TABLE IF EXISTS Customer;
DROP TABLE IF EXISTS User;
DROP TABLE IF EXISTS Address;

-- Tabellen neu erstellen
CREATE TABLE Address (
  address_id INT PRIMARY KEY,
  street VARCHAR(100),
  house_number VARCHAR(10),
  zipcode INT,
  country VARCHAR(255),
  city VARCHAR(255)
);

CREATE TABLE User (
  user_id INT PRIMARY KEY,
  first_name VARCHAR(50),
  last_name VARCHAR(100),
  password VARCHAR(100),
  email VARCHAR(255) UNIQUE,
  address_id INT,
  FOREIGN KEY (address_id) REFERENCES Address(address_id) 
    ON DELETE SET NULL
    ON UPDATE CASCADE
);

CREATE TABLE Customer (
  customer_id INT PRIMARY KEY,
  FOREIGN KEY (customer_id) REFERENCES User(user_id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
);

CREATE TABLE Employee (
  employee_id INT PRIMARY KEY,
  monthly_salary DECIMAL(10,2),
  role VARCHAR(255),
  FOREIGN KEY (employee_id) REFERENCES User(user_id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
);

CREATE TABLE Product (
  product_id INT PRIMARY KEY,
  name VARCHAR(255),
  price DECIMAL(10,2),
  description VARCHAR(255),
  stock_quantity INT,
  image VARCHAR(255)
);

CREATE TABLE Cart (
  cart_id INT PRIMARY KEY,
  customer_id INT,
  total_price DECIMAL(10,2),
  FOREIGN KEY (customer_id) REFERENCES Customer(customer_id) 
    ON DELETE CASCADE -- Wenn Kunde gelöscht wird, werden alle zugehörigen Warenkörbe entfernt
    ON UPDATE CASCADE
);

CREATE TABLE Customer_Order (
  order_id INT PRIMARY KEY,
  customer_id INT,
  date DATE,
  delivery_status VARCHAR(255),
  total_price DECIMAL(10,2),
  payment_method VARCHAR(50),
  FOREIGN KEY (customer_id) REFERENCES Customer(customer_id) 
    ON DELETE RESTRICT -- Bestellungen nicht löschen, wenn Kunde gelöscht wird (Rechtliches, Historie)
    ON UPDATE CASCADE
);

CREATE TABLE Invoice (
  invoice_id INT PRIMARY KEY,
  order_id INT,
  amount DECIMAL(10,2),
  payment_status VARCHAR(255),
  invoice_date DATE,
  due_date DATE,
  FOREIGN KEY (order_id) REFERENCES Customer_Order(order_id) 
    ON DELETE CASCADE -- Rechnung löschen, wenn Bestellung gelöscht wird (keine Bestellung ohne Rechnung)
    ON UPDATE CASCADE
);

CREATE TABLE Product_Change (
  product_change_id INT PRIMARY KEY,
  employee_id INT,
  product_id INT,
  field_changed VARCHAR(255),
  change_date DATE,
  field_before VARCHAR(255),
  field_after VARCHAR(255),
  FOREIGN KEY (employee_id) REFERENCES Employee(employee_id) 
    ON DELETE SET NULL -- Mitarbeiter kann gelöscht werden, Historie bleibt, Verweis wird NULL
    ON UPDATE CASCADE,
  FOREIGN KEY (product_id) REFERENCES Product(product_id) 
    ON DELETE RESTRICT -- Produktänderungen sollen bleiben, auch wenn Produkt gelöscht wird (besser Historie behalten)
    ON UPDATE CASCADE
);

CREATE TABLE Order_Item (
  order_item_id INT PRIMARY KEY,
  order_id INT,
  product_id INT,
  quantity INT,
  price DECIMAL(10,2),
  FOREIGN KEY (order_id) REFERENCES Customer_Order(order_id) 
    ON DELETE CASCADE -- Bestellpositionen werden gelöscht, wenn Bestellung gelöscht wird
    ON UPDATE CASCADE,
  FOREIGN KEY (product_id) REFERENCES Product(product_id) 
    ON DELETE RESTRICT -- Produkt darf nicht gelöscht werden, wenn noch Bestellungen existieren
    ON UPDATE CASCADE
);

CREATE TABLE Cart_Item (
  cart_item_id INT PRIMARY KEY,
  cart_id INT,
  product_id INT,
  quantity INT,
  price DECIMAL(10,2),
  FOREIGN KEY (cart_id) REFERENCES Cart(cart_id) 
    ON DELETE CASCADE -- Warenkorb-Items werden gelöscht, wenn Warenkorb gelöscht wird
    ON UPDATE CASCADE,
  FOREIGN KEY (product_id) REFERENCES Product(product_id) 
    ON DELETE RESTRICT -- Produkt darf nicht gelöscht werden, wenn noch im Warenkorb
    ON UPDATE CASCADE
);


-- Testdaten einfügen
INSERT INTO Address VALUES
(1, 'Hauptstraße', '12', 10115, 'Deutschland', 'Berlin'),
(2, 'Bahnhofstraße', '45', 80331, 'Deutschland', 'München'),
(3, 'Marktplatz', '8', 50667, 'Deutschland', 'Köln'),
(4, 'Lindenweg', '3', 28195, 'Deutschland', 'Bremen'),
(5, 'Gartenstraße', '22', 01067, 'Deutschland', 'Dresden'),
(6, 'Waldweg', '7', 04109, 'Deutschland', 'Leipzig'),
(7, 'Bergstraße', '10', 79098, 'Deutschland', 'Freiburg'),
(8, 'Seestraße', '5', 20095, 'Deutschland', 'Hamburg'),
(9, 'Parkallee', '20', 90402, 'Deutschland', 'Nürnberg'),
(10, 'Rosenweg', '14', 70173, 'Deutschland', 'Stuttgart');

-- Benutzer + NEUE Benutzer
INSERT INTO User VALUES
(1, 'Anna', 'Müller', '1', 'anna.mueller@example.com', 1),
(2, 'Ben', 'Schmidt','2', 'ben.schmidt@example.com', 2),
(3, 'Clara', 'Weber','3', 'clara.weber@example.com', 3),
(4, 'David', 'Neumann','4', 'david.neumann@example.com', 4),
(5, 'Emma', 'Schneider','5', 'emma.schneider@example.com', 5),
(6, 'Felix', 'Hoffmann', '6','felix.hoffmann@example.com', 6),
(7, 'Greta', 'Schulz', '7', 'greta.schulz@example.com', 7),
(8, 'Heiko', 'Brandt', '8','heiko.brandt@example.com', 8),
(9, 'Ines', 'Meier', '9','ines.meier@example.com', 9),
(10, 'Jonas', 'Friedrich', '10', 'jonas.friedrich@example.com', 10),
(11, 'Max', 'Mustermann', '1', '1', 1),
(12, 'Lisa', 'Beispiel', '2', '2', 2);   

INSERT INTO Customer VALUES
(1),
(2),
(3),
(4),
(5),
(12);

INSERT INTO Employee VALUES
(6, 2800.00, 'Verwaltung'),
(7, 3200.00, 'Lager'),
(8, 3000.00, 'Kundenservice'),
(9, 3500.00, 'Produktmanagement'),
(10, 4000.00, 'Geschäftsführung'),
(11, 2500.00, 'Admin'); 

INSERT INTO Product VALUES
(1, 'Monstera Deliciosa', 25.00, 'Beliebte tropische Zimmerpflanze mit großen Blättern.', 50, 'monsteradeliciosa.jpg'),
(2, 'Ficus Benjamina', 30.00, 'Pflegeleichter Zimmerbaum, auch „Birkenfeige“ genannt.', 40, 'ficusbenjamina.jpg'),
(3, 'Sansevieria', 20.00, 'Ideal für Anfänger.', 60, 'sansevieria.jpg'),
(4, 'Aloe Vera', 15.00, 'Heilpflanze mit pflegeleichten Ansprüchen.', 80, 'aloevera.jpg'),
(5, 'Calathea', 35.00, 'Dekorative Blätter mit Muster – braucht viel Feuchtigkeit.', 30, 'calathea.jpg');
(6, 'Hoya Kerrii', 15.00, 'Herzförmige Blätter, beliebte Geschenkidee.', 45, 'hoyakerrii.jpg'),
(7, 'Sinningia', 22.00, 'Blütenreiche Zimmerpflanze mit samtigen Blättern.', 35, 'sinningia.jpg'),
(8, 'Zamioculcas Zamiifolia', 28.00, 'Robuste Pflanze, ideal für dunklere Räume.', 50, 'zamioculcaszamiifolia.jpg'),
(9, 'Orchideen', 32.00, 'Elegante Blühpflanze mit exotischem Flair.', 40, 'orchideen.jpg'),
(10, 'Lithops', 18.00, '„Lebende Steine“ – sukkulente Miniaturpflanzen.', 55, 'lithops.jpg'),
(11, 'Lavendel', 12.00, 'Duftende Pflanze mit beruhigender Wirkung.', 70, 'lavendel.jpg');


INSERT INTO Cart VALUES
(1, 1, 65.00),
(2, 2, 20.00),
(3, 3, 60.00),
(4, 4, 25.00),
(5, 5, 35.00);

INSERT INTO Cart_Item VALUES
(1, 1, 1, 2, 50.00),
(2, 1, 4, 1, 15.00),
(3, 2, 3, 1, 20.00),
(4, 3, 2, 2, 60.00),
(5, 4, 5, 1, 35.00);

INSERT INTO Customer_Order VALUES
(1, 1, '2025-06-01', 'versendet', 65.00, 'PayPal'),
(2, 2, '2025-06-05', 'in Bearbeitung', 60.00, 'Rechnung'),
(3, 3, '2025-06-10', 'versendet', 30.00, 'SEPA'),
(4, 4, '2025-06-15', 'offen', 35.00, 'Kreditkarte'),
(5, 5, '2025-06-20', 'abgeschlossen', 35.00, 'PayPal');

INSERT INTO Order_Item VALUES
(1, 1, 1, 2, 50.00),
(2, 1, 4, 1, 15.00),
(3, 2, 3, 3, 60.00),
(4, 3, 2, 1, 30.00),
(5, 4, 5, 1, 35.00);

INSERT INTO Invoice VALUES
(1, 1, 65.00, 'bezahlt', '2025-06-01', '2025-06-08'),
(2, 2, 60.00, 'offen', '2025-06-05', '2025-06-12'),
(3, 3, 30.00, 'bezahlt', '2025-06-10', '2025-06-17'),
(4, 4, 35.00, 'offen', '2025-06-15', '2025-06-22'),
(5, 5, 35.00, 'bezahlt', '2025-06-20', '2025-06-27');

INSERT INTO Product_Change VALUES
(1, 9, 1, 'price', '2025-06-01', '20', '25'),
(2, 9, 3, 'description', '2025-06-02', 'Ideal für Anfänger', 'Ideal für Anfänger'),
(3, 8, 5, 'stock_quantity', '2025-06-03', '20', '30'),
(4, 7, 4, 'price', '2025-06-04', '10', '15'),
(5, 7, 2, 'name', '2025-06-05', 'Ficus', 'Ficus Benjamina');


--Trigger

--leeren Warenkorb für jeden User erstellen 
CREATE TRIGGER create_cart_after_new_customer
AFTER INSERT ON Customer
FOR EACH ROW
BEGIN
  INSERT INTO Cart (cart_id, customer_id, total_price)
  VALUES (NEW.customer_id, NEW.customer_id, 0.00);
END;

--cart updaten (nach hinzufügen neuer produkte)
CREATE TRIGGER cart_total_after_cartitem_insert
AFTER INSERT ON Cart_Item
FOR EACH ROW
BEGIN
  UPDATE Cart
  SET total_price = (
    SELECT SUM(price) FROM Cart_Item WHERE cart_id = NEW.cart_id
  )
  WHERE cart_id = NEW.cart_id;
END;

CREATE TRIGGER cart_total_after_cartitem_update
AFTER UPDATE ON Cart_Item
FOR EACH ROW
BEGIN
  UPDATE Cart
  SET total_price = (
    SELECT SUM(price) FROM Cart_Item WHERE cart_id = NEW.cart_id
  )
  WHERE cart_id = NEW.cart_id;
END;

CREATE TRIGGER cart_total_after_cartitem_delete
AFTER DELETE ON Cart_Item
FOR EACH ROW
BEGIN
  UPDATE Cart
  SET total_price = (
    SELECT COALESCE(SUM(price), 0) FROM Cart_Item WHERE cart_id = OLD.cart_id
  )
  WHERE cart_id = OLD.cart_id;
END;

--Produktänderungen
CREATE TRIGGER log_product_update
AFTER UPDATE ON Product
FOR EACH ROW
BEGIN
  IF OLD.price <> NEW.price THEN
    INSERT INTO Product_Change (product_change_id, employee_id, product_id, field_changed, change_date, field_before, field_after)
    VALUES (
      NULL, NULL, NEW.product_id, 'price', CURRENT_DATE, OLD.price, NEW.price
    );
  END IF;

  IF OLD.name <> NEW.name THEN
    INSERT INTO Product_Change (product_change_id, employee_id, product_id, field_changed, change_date, field_before, field_after)
    VALUES (
      NULL, NULL, NEW.product_id, 'name', CURRENT_DATE, OLD.name, NEW.name
    );
  END IF;

  IF OLD.description <> NEW.description THEN
    INSERT INTO Product_Change (product_change_id, employee_id, product_id, field_changed, change_date, field_before, field_after)
    VALUES (
      NULL, NULL, NEW.product_id, 'description', CURRENT_DATE, OLD.description, NEW.description
    );
  END IF;

  IF OLD.stock_quantity <> NEW.stock_quantity THEN
    INSERT INTO Product_Change (product_change_id, employee_id, product_id, field_changed, change_date, field_before, field_after)
    VALUES (
      NULL, NULL, NEW.product_id, 'stock_quantity', CURRENT_DATE, OLD.stock_quantity, NEW.stock_quantity
    );
  END IF;
END;
