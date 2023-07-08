import express from "express";
import item from "../Models/items/items.js";
import unit from "../Models/items/unit.js";
import { item as table } from "../utils/tableNames.js";
import { unit as unitConfig, item as itemConfig } from "../utils/IDConfig.js";

const router = express.Router();
const Unit = new unit(table.unit, unitConfig);
const Item = new item(table.item, itemConfig, Unit);

router.get("/get", function (req, res) {
  Item.getItems(req, res);
});

router.post("/add", function (req, res) {
  Item.addItem(req, res);
});

export default router;
