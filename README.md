
# Invoice-App

Invoice API is built using REST principles.
An invoice management backend app is a software application designed to the process of creating, sending, tracking, and managing invoices within a business.




## Tech Stack

**Programming Language:** Javascript

**Server:** Node, Express

**Database:** MYSQL
## Run Locally

Clone the project

```bash
  git clone https://github.com/meena-programmer/invoice-app
```
Run Sql queries

```bash
  /resources/sql/queries.sql
```

Go to the project directory

```bash
  cd invoice-app
```

Install dependencies

```bash
  npm install
```

Start the server

```bash
  npm start
```

Start the server with watch-mode

```bash
  npm run dev
```



## Environment Variables

To run this project, you will need to update the following environment variables to your .env file

`DB_HOST`
`DB_USER`
`DB_PASSWORD`
`DB_DATABASE`
`DB_PORT`

`JWT_SECRET`

## Email Config

In Config/mail_config.js, change mail transporter.

 `service`
  `user`
  `pass`
  `sender`


## Table Hierarchy
### User 
- **user:** stores organization information.
### Customer
- **customer**: stores customer information ![foreign key constraints](https://img.shields.io/badge/organization_id-ForeignKey%20Constraints-brightgreen) of User table
- **customer_address**: contains billing and shipping address for each customer with ![foreign key constraints](https://img.shields.io/badge/customer_id-ForeignKey%20Constraints-brightgreen) of customer table
- **contact_person**: Stores contact information for each customer with ![foreign key constraints](https://img.shields.io/badge/customer_id-ForeignKey%20Constraints-brightgreen) of customer table

## Item
- **item**: stores product information ![foreign key constraints](https://img.shields.io/badge/organization_id-ForeignKey%20Constraints-brightgreen) of User table
- **unit**: Stores common unit information.

## Invoice
- **invoice**: stores invoice information ![foreign key constraints](https://img.shields.io/badge/organization_id%20&%20customer_id-ForeignKey%20Constraints-brightgreen) of User table and customer table
- **invoice_item**: Stores the details of items with ![foreign key constraints](https://img.shields.io/badge/invoice_id%20&%20item_id-ForeignKey%20Constraints-brightgreen) of invoice table and item table.
- **recurring_invoice**: Stores information about recurring invoices with ![foreign key constraints](https://img.shields.io/badge/invoice_id-ForeignKey%20Constraints-brightgreen) of invoice table.
- **tax**: Stores common tax-related information.

## Credit Notes
- **credit_notes**: stores Credit Notes information ![foreign key constraints](https://img.shields.io/badge/organization_id-ForeignKey%20Constraints-brightgreen) of User table
- **credit_notes_item**: Stores the details of items included in each credit note with ![foreign key constraints](https://img.shields.io/badge/credit_notes_id-ForeignKey%20Constraints-brightgreen) of credit_notes table


## Payment
- **payment**: stores Payment information ![foreign key constraints](https://img.shields.io/badge/organization_id%20&%20invocie_id-ForeignKey%20Constraints-brightgreen) of User table and Invoice table
- **payment_invoice**: Stores payment-related information for each invoice with ![foreign key constraints](https://img.shields.io/badge/payment_id-ForeignKey%20Constraints-brightgreen) of payment table

## Estimates
- **estimates**: stores Estimation Invoice information ![foreign key constraints](https://img.shields.io/badge/organization_id-ForeignKey%20Constraints-brightgreen) of User table
- **estimates_item**: Stores the details of items included in each estimate  with ![foreign key constraints](https://img.shields.io/badge/estimate_id-ForeignKey%20Constraints-brightgreen) of estimates table

## API Reference - GET

#### Insert user
```http
   POST /user/register
```
- Request Body:
- ```
  {
    "name": "string",
    "mobile": 111,
    "password": "xyz",
    "confirmPassword":"xyz",
    "companyName": "string",
    "company_address": "string",
    "company_website": "string",
    "email": "string"
  }
  ```
#### Insert Item
```http
  POST /user/login
```
- Request Body:
- ```
  {
    "username": mobile number,
    "password":"xyz"
  }
  ```
#### Insert Customer
```http
  POST /customer/add
```
- Request Body:
- ```
  {
    "display_name": "string",
    "type": "Sales",
    "shipping_address": {
        "attention": "string",
        "address_line1": "string",
        "address_line2": "string",
        "city": "string",
        "state": "string",
        "zip_code": "string",
        "fax": "string",
        "contact": "string",
        "email": "string"
    },
    "billing_address": {
        "attention": "string",
        "address_line1": "string",
        "address_line2": "string",
        "city": "string",
        "state": "string",
        "zip_code": "string",
        "fax": "string",
        "contact": "string",
        "email": "string"
    },
    "contact_persons": [
        {
            "name": "string",
            "contact": "string",
            "email": "string",
            "designation": "string",
            "department": "string"
        },
        {
            "name": "string",
            "contact": "string",
            "email": "string",
            "designation": "string",
            "department": "string"
        }
    ]
  }
  ```
- Request Header:

- ```
  {
    "organization_id": "string"
  }
  ```

#### Insert Item
```http
  POST /item/add
```
- Request Body:
- ```
  {
    "item_type": "string",
    "product_type": "string",
    "name": "string",
    "rate": 400,
    "unit": "GB",
    "description": "string",
    "sku": "string",
    "tax_id": "string",
    "tax_type": "string",
    "tax_exemption_id": "string"
  }
  ```
- Request Header:

- ```
  {
    "organization_id": "string"
  }
  ```

#### Insert Invoice
```http
  POST /invoice/add
```
- Request Body:
- ```
  {
    "customer_id":"string",
    "reference_id":"string",
    "payment_terms":"string",
    "payment_terms_label":"string",
    "invoice_date":"2023-07-05 23:59:59",
    "due_date":"2023-12-31 23:59:59",
    "notes":"string",
    "terms":"string",
    "subject":"string",
    "sub_total":50,
    "discount":5,
    "discount_type":"entity level",
    "adjustment":1.50,
    "total":55,
    "allow_partial_payment":true,
    "shipping_charge":0,
    "payment_status":"DRAFT",
    "line_items":[
        {
            "item_id":"string",
            "item_order":1,
            "rate":20,
            "quantity":2,
            "amount":40,
            "discount":0,
            "description":"string"
        }
    ]
  }
  ```
- Request Header:

- ```
  {
    "organization_id": "string"
  }
  ```

#### Insert Payment
```http
  POST /payment/add
```
- Request Body:
- ```
  {
    "customer_id": "string",
    "payment_mode": "string",
    "description": "string",
    "reference_id": "string",
    "payment_date": "2023-07-05 23:59:59",
    "amount": 50,
    "invoices": {
        "invoice_id": "string",
        "item_order":1,
        "discount":5,
        "description":"string",
        "quantity:1,
        "rate":40,
        "amount": 55,
    }
  }
  ```
- Request Header:

- ```
  {
    "organization_id": "string"
  }
  ```


#### Insert Recurring Invoice
```http
  POST /recurringinvoice/add
```
- Request Body:
- ```
  {
    "customer_id": "string",
    "reference_id": "string",
    "payment_terms": "string",
    "payment_terms_label": "string",
    "invoice_date": "2023-07-05 23:59:59",
    "due_date": "2023-12-31 23:59:59",
    "notes": "string",
    "terms": "string",
    "subject": "string",
    "sub_total": 50,
    "discount": 5,
    "discount_type": "entity level",
    "adjustment": 1.50,
    "total": 55,
    "allow_partial_payment": true,
    "shipping_charge": 0,
    "payment_status": "UNPAID",
    "recurrance_name": "string",
    "recurrance_start": "2023-07-05 23:59:59",
    "recurrance_end": "",
    "repeat_every": 1,
    "recurrance_frequency": "Weeks",
    "line_items": [
        {
            "item_id": "string",
            "item_order": 1,
            "rate": 20,
            "quantity": 2,
            "amount": 40,
            "discount": 0,
            "description": "string"
        }
    ]
  }
  ```
- Request Header:

- ```
  {
    "organization_id": "string"
  }
  ```


#### Insert Credit Notes
```http
  POST /creditnotes/add
```
- Request Body:
- ```
  {
    "customer_id": "string",
    "reference_no": "string",
    "notes": "string",
    "date":"2023-12-31 23:59:59",
    "terms": "string",
    "subject": "string",
    "discount": 5,
    "discount_type": "entity level",
    "sub_total": 50,
    "total": 60,
    "tax_id": "string",
    "adjustment": 5,
    "line_items": [
        {
            "item_id": "string",
            "item_order": 1,
            "rate": 20,
            "quantity": 2,
            "amount": 40,
            "discount": 0,
            "description": "string"
        }
    ]
  }
  ```
- Request Header:

- ```
  {
    "organization_id": "string"
  }
  ```

####  Credit Apply to Invoice
```http
  POST /creditnotes/applytoinvoice
```
- Request Body:
- ```
  {
    "credit_notes_id": "string",
    "invoices": [
        {
            "invoice_id": "string",
            "amount_applied": 5
        }
    ]
  }
  ```
- Request Header:

- ```
  {
    "organization_id": "string"
  }
  ```
####  Send Invoice to Customer
```http
  POST /invoice/send
```
- Request Body:
- ```
  {
    "invoice_id":"INV-202300001",
    "project_id":"IV00001",
    "email_id":"string"
  }
  ```
- Request Header:

- ```
  {
    "organization_id": "string"
  }
  ```

#### Get All invoices
```http
  GET /invoice/get
```
#### Get all payments
```http
  GET /payment/get
```
#### Get all items

```http
  GET /item/get
```
#### Get all Customers

```http
  GET /customer/get
```
#### Get all credit notes
```http
  GET /creditnotes/get
```
#### Get all recurring invoice
```http
  GET /recurringinvoice/get
```

### Modules used

This project is uses the following main modules:

- nodemailer - for sending email
- express
- mysql2


## Learned & experience

Through this task, I have gained proficiency in managing nested queries and incorporating modularity into my approach.

