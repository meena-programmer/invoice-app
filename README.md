# invoice-app
## Table Hierarchy - Invoice Management System
## User 
- **user:** stores organisation information.
## Customer
- **customer**: stores customer information
- **customer_address**: contains billing and shipping address for each customer with ![foreign key constraints](https://img.shields.io/badge/Foreign%20Key-Constraints-brightgreen) of customer table
- **contact_person**: Stores contact information for each customer with ![foreign key constraints](https://img.shields.io/badge/Foreign%20Key-Constraints-brightgreen) of customer table

## Item
- **item**: stores product information
- **unit**: Stores common unit information.

## Invoice
- **invoice**: stores invoice information
- **invoice_item**: Stores the details of items with ![foreign key constraints](https://img.shields.io/badge/Foreign%20Key-Constraints-brightgreen) of invoice table.
- **recurring_invoice**: Stores information about recurring invoices with ![foreign key constraints](https://img.shields.io/badge/Foreign%20Key-Constraints-brightgreen) of invoice table.
- **tax**: Stores common tax-related information.

## Credit Notes
- **credit_notes**: stores Credit Notes information
- **credit_notes_item**: Stores the details of items included in each credit note with ![foreign key constraints of credit_notes table](https://img.shields.io/badge/Foreign%20Key-Constraints-brightgreen)

## Estimates
- **estimates**: stores Estimation Invoice information
- **estimates_item**: Stores the details of items included in each estimate  with foreign key constrains of estimates table

## Payment
- **payment**: stores Payment information
- **payment_invoice**: Stores payment-related information for each invoice with foreign key constrains of payment table
