import { customerTableRelation } from "./customerTable.js";

const Payment = {
  table: "payment",
  unique_key: "payment_id",
};

const PaymentInvoice = {
  table: "payment_invoice",
  unique_key: "payment_invoice_id",
  columns: [
    "payment_invoice_id",
    "invoice_id",
    "amount",
    "tax_amount",
    "bank_charge",
  ],
};

const paymentTableRelation = {
  main: {
    ...Payment,
    payment_invoice_key: "payment_id",
    customer_key: "customer_id",
  },
  sub: [
    {
      main: { ...PaymentInvoice },
    },
    {
      ...customerTableRelation,
    },
  ],
};

export { paymentTableRelation };
