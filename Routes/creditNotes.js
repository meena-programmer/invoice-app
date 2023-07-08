import express from "express";
import credit_notes_item from "../Models/creditNotes/credit_notes_item.js";
import credit_notes from "../Models/creditNotes/credit_notes.js";
import {
  credit_notes_item as credit_notes_item_idConfig,
  credit_notes as credit_notes_idConfig,
} from "../utils/IDConfig.js";
import {
  invoice as invoiceTable,
  credit_notes as table,
} from "../utils/tableNames.js";
import redeem_credit from "../Models/creditNotes/redeem_credit.js";
import invoice_status_update from "../Models/invoice/invoice_status_update.js";

const router = express.Router();
const CreditNotesItem = new credit_notes_item(
  table.credit_notes_item,
  credit_notes_item_idConfig
);
const CreditNotes = new credit_notes(
  table.credit_notes,
  credit_notes_idConfig,
  CreditNotesItem
);
const InvoiceStatusUpdate = new invoice_status_update(invoiceTable.invoice);
const RedeemCredit = new redeem_credit(
  InvoiceStatusUpdate,
  invoiceTable.invoice,
  table.credit_notes
);

router.get("/get", function (req, res) {
  CreditNotes.getCreditNotes(req, res);
});

router.post("/add", function (req, res) {
  CreditNotes.addCreditNotes(req, res);
});

router.post("/applytoinvoice", function (req, res) {
  RedeemCredit.applyToInvoice(req, res);
});

export default router;
