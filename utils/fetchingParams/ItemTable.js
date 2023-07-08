const Item = {
  table: "item",
  unique_key: "item_id",
  columns: [
    "item_id",
    "name",
    "rate",
    "item_type",
    "product_type",
    "description",
    "sku",
    "organization_id",
    "unit_id",
    "created_on",
    "updated_on",
    "tax_id",
    "tax_exemption_id",
    "tax_type",
  ],
};
const Unit = {
  table: "unit",
  unique_key: "unit_id",
  columns: ["unit_id", "created_on", "updated_on", "unit", "unit_name"],
};

const itemTableRelation = {
  main: {
    ...Item,
    unit_key: "unit_id",
  },
  sub: [
    {
      main: { ...Unit },
    },
  ],
};

export { itemTableRelation };
