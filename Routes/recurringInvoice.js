import express from "express";
import invoice from "../Models/invoice/invoice.js";
import invoice_item from "../Models/invoice/invoice_item.js";
import recurring_invoice from "../Models/invoice/recurring_invoice.js";
import invoice_status_update from "../Models/invoice/invoice_status_update.js";
import { invoice as invoiceTable } from "../utils/tableNames.js";
import {
  invoice as invoiceConfig,
  invoice_item as invoiceItemConfig,
  recurring_invoice as recurringInvoiceConfig,
} from "../utils/IDConfig.js";

const router = express.Router();

const InvoiceStatusUpdate = new invoice_status_update(invoiceTable.invoice);

const InvoiceItem = new invoice_item(
  invoiceTable.invoice_item,
  invoiceItemConfig
);

const RecurringInvoice = new recurring_invoice(
  invoiceTable.recurring_invoice,
  recurringInvoiceConfig,
  InvoiceStatusUpdate
);

const Invoice = new invoice(
  invoiceTable.invoice,
  invoiceConfig,
  InvoiceItem,
  RecurringInvoice,
  "recurring_invoice"
);

router.get("/get", function (req, res) {
  Invoice.getInvoices(req, res);
});

router.post("/add", function (req, res) {
  Invoice.addInvoice(req, res);
});

export default router;
