import assert from "assert";

export function customerRequestOrganizer(req) {
  const {
    name = "",
    display_name,
    type,
    company_name = "",
    website = "",
    contact = "",
    email = "",
    gst_no = "",
    pan_no = "",
    payment_terms = 0,
    payment_label = "",
    currency = "",
    notes = "",
    tax_id = "",
    tax_exemption_id = "",
    tds_tax_id = "",
    gst_treatment = "",
    tax_treatment = "",
  } = req.body;

  assert(display_name, "Customer Display Name is required");
  assert(type, "Customer Type is required");

  const customerInfo = {
    name,
    display_name,
    type,
    company_name,
    website,
    contact,
    email,
    gst_no,
    pan_no,
    payment_terms,
    payment_label,
    currency,
    notes,
    tax_id,
    tax_exemption_id,
    tds_tax_id,
    gst_treatment,
    tax_treatment,
    organization_id: req.organization_id,
  };

  return customerInfo;
}

export function itemRequestOrganizer(req) {
  const {
    item_type,
    product_type,
    name,
    rate,
    description = "",
    sku = "",
    tax_id = "",
    tax_type = "",
    tax_exemption_id = "",
  } = req.body;

  assert(req.body.name, "Item Name is required");
  assert(req.body.rate, "Rate is required");

  const itemData = {
    item_type,
    product_type,
    name,
    rate,
    unit_id: "",
    description,
    sku,
    tax_id,
    tax_type,
    tax_exemption_id,
    organization_id: req.organization_id,
  };

  return itemData;
}

export function invoiceRequestOrganizer(req, type) {
  const {
    customer_id,
    reference_id = "",
    payment_terms,
    payment_terms_label,
    invoice_date,
    due_date,
    notes = "",
    terms = "",
    subject = "",
    sub_total,
    discount,
    discount_type,
    adjustment,
    tax_id = "",
    total,
    allow_partial_payment,
    shipping_charge,
    payment_status = "DRAFT",

    recurrance_name,
    recurrance_start,
    recurrance_end,
    repeat_every,
    recurrance_frequency,
    status = "Active",
  } = req.body;

  assert(customer_id, "Customer ID is required");
  assert(invoice_date, "Invoice Date is required");

  const invoiceInfo = {
    customer_id,
    reference_id,
    payment_terms,
    payment_terms_label,
    due_date,
    invoice_date,
    notes,
    terms,
    subject,
    sub_total,
    discount,
    discount_type,
    adjustment,
    ...(tax_id && { tax_id }),
    total,
    allow_partial_payment,
    shipping_charge,
    payment_status,
    organization_id: req.organization_id,
  };

  const recurringInvoiceInfo = {
    ...(type === "recurring_invoice" && {
      customer_id,
      recurrance_name,
      recurrance_start,
      ...(recurrance_end && { recurrance_end }),
      repeat_every,
      recurrance_frequency,
      total,
      status,
    }),
  };

  return { invoiceInfo, recurringInvoiceInfo };
}

export function paymentRequestOrganizer(req) {
  const {
    customer_id,
    payment_mode = "CASH",
    description = "",
    reference_id = "",
    payment_date,
    amount,
  } = req.body;

  assert(req.body.customer_id, "Customer ID is required");
  assert(req.body.amount, "Amount received is required");
  assert(req.body.payment_date, "Payment Date is required");

  const paymentInfo = {
    customer_id,
    payment_mode,
    description,
    reference_id,
    amount,
    payment_date,
    organization_id: req.organization_id,
  };

  return paymentInfo;
}

export function creditNotesRequestOrganizer(req) {
  const {
    customer_id,
    reference_no = "",
    notes = "",
    terms = "",
    subject = "",
    discount,
    discount_type,
    sub_total,
    total,
    tax_id = "",
    adjustment,
    date,
    status = "Active",
  } = req.body;

  assert(customer_id, "Customer Profile is required");
  assert(date, "Credit Notes Date is required");

  const creditNotesInfo = {
    customer_id,
    reference_no,
    notes,
    terms,
    subject,
    discount,
    discount_type,
    sub_total,
    total,
    tax_id,
    adjustment,
    status,
    organization_id: req.organization_id,
  };

  return creditNotesInfo;
}
