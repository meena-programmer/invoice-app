const Customer = {
  table: "customer",
  unique_key: "customer_id",
  columns: [
    "name",
    "display_name",
    "type",
    "company_name",
    "website",
    "contact",
    "email",
    "gst_no",
    "pan_no",
    "payment_terms",
    "payment_label",
    "currency",
    "notes",
    "tax_id",
    "tax_exemption_id",
    "tds_tax_id",
    "gst_treatment",
    "tax_treatment",
    "created_on",
    "updated_on",
  ],
};
const CustomerAddress = {
  table: "customer_address",
  unique_key: "address_id",
  columns: [
    "address_id",
    "address_type",
    "attention",
    "address_line1",
    "address_line2",
    "city",
    "state",
    "zip_code",
    "contact",
    "fax",
    "email",
  ],
};
const ContactPerson = {
  table: "contact_person",
  unique_key: "contact_id",
  columns: [
    "contact_id",
    "name",
    "contact",
    "email",
    "designation",
    "department",
  ],
};

const customerTableRelation = {
  main: {
    ...Customer,
    customer_address_key: "customer_id",
    contact_person_key: "customer_id",
  },
  sub: [
    {
      main: { ...CustomerAddress, unique_key: "customer_id" },
    },
    {
      main: { ...ContactPerson, unique_key: "customer_id" },
    },
  ],
};

export { customerTableRelation };
