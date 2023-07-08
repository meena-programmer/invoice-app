# invoice-app
# Table Hierarchy - Invoice Management System
## User : stores organisation information.
## Customer
- **customer_address**: contains billing and shipping address for each customer with foreign key constrains of customer table
- **contact_person**: Stores contact information for each customer with foreign key constrains of customer table

## Item
- **unit**: Stores common unit information.

## Invoice
- **invoice_item**: Stores the details of items with foreign key constrains of invoice table.
- **recurring_invoice**: Stores information about recurring invoices with foreign key constrains of invoice table.
- **tax**: Stores common tax-related information with foreign key constrains of invoice table.

## Credit Notes
- **credit_notes_item**: Stores the details of items included in each credit note with foreign key constrains of credit_notes table

## Estimates
- **estimates_item**: Stores the details of items included in each estimate  with foreign key constrains of estimates table

## Payment
- **payment_invoice**: Stores payment-related information for each invoice with foreign key constrains of payment table
