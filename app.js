import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import path from "node:path";
import authenticator from "./utils/authenticator.js";

import * as url from "node:url";
const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

import ItemRouter from "./Routes/items.js";
import UserRouter from "./Routes/users.js";
import CustomerRouter from "./Routes/customers.js";
import InvoiceRouter from "./Routes/invoices.js";
import PaymentRouter from "./Routes/payments.js";
import RecurringInvoiceRouter from "./Routes/recurringInvoice.js";
import CreditNotes from "./Routes/creditNotes.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Allowing JSON to be parsed as request parameter
app.use(bodyParser.json({ type: "*/*" }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());
app.use(authenticator);

app.use("/item", ItemRouter);
app.use("/user", UserRouter);
app.use("/customer", CustomerRouter);
app.use("/invoice", InvoiceRouter);
app.use("/recurringinvoice", RecurringInvoiceRouter);
app.use("/payment", PaymentRouter);
app.use("/creditnotes", CreditNotes);

export default app;
