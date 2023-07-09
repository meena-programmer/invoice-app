# invoice-app
## Table Hierarchy
## User 
- **user:** stores organisation information.
## Customer
- **customer**: stores customer information ![foreign key constraints](https://img.shields.io/badge/Foreign%20Key-Constraints-brightgreen) of User table
- **customer_address**: contains billing and shipping address for each customer with ![foreign key constraints](https://img.shields.io/badge/Foreign%20Key-Constraints-brightgreen) of customer table
- **contact_person**: Stores contact information for each customer with ![foreign key constraints](https://img.shields.io/badge/Foreign%20Key-Constraints-brightgreen) of customer table

## Item
- **item**: stores product information ![foreign key constraints](https://img.shields.io/badge/Foreign%20Key-Constraints-brightgreen) of User table
- **unit**: Stores common unit information.

## Invoice
- **invoice**: stores invoice information ![foreign key constraints](https://img.shields.io/badge/Foreign%20Key-Constraints-brightgreen) of User table and customer table
- **invoice_item**: Stores the details of items with ![foreign key constraints](https://img.shields.io/badge/Foreign%20Key-Constraints-brightgreen) of invoice table and item table.
- **recurring_invoice**: Stores information about recurring invoices with ![foreign key constraints](https://img.shields.io/badge/Foreign%20Key-Constraints-brightgreen) of invoice table.
- **tax**: Stores common tax-related information.

## Credit Notes
- **credit_notes**: stores Credit Notes information ![foreign key constraints](https://img.shields.io/badge/Foreign%20Key-Constraints-brightgreen) of User table
- **credit_notes_item**: Stores the details of items included in each credit note with ![foreign key constraints](https://img.shields.io/badge/Foreign%20Key-Constraints-brightgreen) of credit_notes table

## Estimates
- **estimates**: stores Estimation Invoice information ![foreign key constraints](https://img.shields.io/badge/Foreign%20Key-Constraints-brightgreen) of User table
- **estimates_item**: Stores the details of items included in each estimate  with ![foreign key constraints](https://img.shields.io/badge/Foreign%20Key-Constraints-brightgreen) of estimates table

## Payment
- **payment**: stores Payment information ![foreign key constraints](https://img.shields.io/badge/Foreign%20Key-Constraints-brightgreen) of User table and Invoice table
- **payment_invoice**: Stores payment-related information for each invoice with ![foreign key constraints](https://img.shields.io/badge/Foreign%20Key-Constraints-brightgreen) of payment table
