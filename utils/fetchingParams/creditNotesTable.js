import { itemTableRelation } from "./ItemTable.js";
import { customerTableRelation } from "./customerTable.js";

const CreditNotes = {
  table: "credit_notes",
  unique_key: "project_id",
};

const CreditNotesItem = {
  table: "credit_notes_item",
  unique_key: "line_item_id",
  columns: [
    "item_id",
    "item_order",
    "line_item_id",
    "rate",
    "quantity",
    "amount",
    "discount",
    "description",
  ],
};

const Tax = {
  table: "tax",
  unique_key: "tax_id",
  columns: [
    "tax_id",
    "section",
    "name",
    "percentage",
    "type",
    "start_date",
    "end_date",
  ],
};

const creditNotesTableRelation = {
  main: {
    ...CreditNotes,
    credit_notes_item_key: "project_id",
    tax_key: "tax_id",
    customer_key: "customer_id",
  },
  sub: [
    {
      main: {
        ...CreditNotesItem,
        unique_key: "credit_notes_id",
        item_key: "item_id",
      },
      sub: [itemTableRelation],
    },
    {
      ...customerTableRelation,
    },
    {
      main: { ...Tax, key: "tax_id" },
    },
  ],
};

export { creditNotesTableRelation };
