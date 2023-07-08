import express from "express";
import customer from "../Models/customers/customer.js";
import address from "../Models/customers/customer_address.js";
import contact from "../Models/customers/contact_person.js";
import {
  address as addressConfig,
  contacts as contactConfig,
  customer as customerConfig,
} from "../utils/IDConfig.js";
import { customer as table } from "../utils/tableNames.js";

const router = express.Router();
const Address = new address(table.customer_address, addressConfig);
const Contact = new contact(table.contact_person, contactConfig);
const Customer = new customer(table.customer, customerConfig, Address, Contact);

router.get("/get", function (req, res) {
  Customer.getCustomers(req, res);
});

router.post("/add", function (req, res) {
  Customer.addCustomer(req, res);
});

export default router;
