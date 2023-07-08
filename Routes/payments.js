import express from "express";
import payment from "../Models/payment/payment.js";
import payment_invoice from "../Models/payment/payment_invoice.js";
import invoice_status_update from "../Models/invoice/invoice_status_update.js";
import { invoice as invoiceTable } from "../utils/tableNames.js";
import { payment as paymentTable } from "../utils/tableNames.js";
import {
  payment as paymentConfig,
  payment_invoice as paymentInvoiceConfig,
} from "../utils/IDConfig.js";

const router = express.Router();
const InvoiceStatusUpdate = new invoice_status_update(invoiceTable.invoice);

const PaymentInvoice = new payment_invoice(
  paymentTable.payment_invoice,
  paymentInvoiceConfig
);
const Payment = new payment(
  paymentTable.payment,
  paymentConfig,
  PaymentInvoice,
  InvoiceStatusUpdate
);

router.get("/get", function (req, res) {
  Payment.getPayments(req, res);
});

router.post("/add", function (req, res) {
  Payment.addPayment(req, res);
});

export default router;
