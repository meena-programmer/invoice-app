import express from "express";
import invoice from "../Models/invoice/invoice.js";
import invoice_item from "../Models/invoice/invoice_item.js";
import { invoice_item as invoiceItemConfig } from "../utils/IDConfig.js";
import invoice_status_update from "../Models/invoice/invoice_status_update.js";
import { invoice as invoice_table } from "../utils/tableNames.js";
import { invoice as invoiceConfig } from "../utils/IDConfig.js";

const router = express.Router();
const InvoiceStatusUpdate = new invoice_status_update(invoice_table.invoice);

const InvoiceItem = new invoice_item(
  invoice_table.invoice_item,
  invoiceItemConfig
);
const Invoice = new invoice(invoice_table.invoice, invoiceConfig, InvoiceItem);

router.get("/get", function (req, res) {
  Invoice.getInvoices(req, res);
});

router.post("/add", function (req, res) {
  Invoice.addInvoice(req, res);
});

router.post("/send", function (req, res) {
  InvoiceStatusUpdate.sendInvoice(req, res);
});

export default router;
