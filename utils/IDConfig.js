const date = new Date();

const year = date.getFullYear();

export const organization = {
  idLength: 5,
  startsWith: "ORG",
};
export const item = {
  idLength: 10,
  startsWith: "PR",
};
export const unit = {
  idLength: 5,
  startsWith: "UN",
};
export const customer = {
  idLength: 8,
  startsWith: "CST",
};
export const address = {
  idLength: 8,
  startsWith: "AD",
};
export const contacts = {
  idLength: 8,
  startsWith: "CP",
};
export const invoice = {
  idLength: 5,
  startsWith: `INV-${year}`,
  invoice_startsWith: `IV`,
};
export const recurring_invoice = {
  idLength: 5,
  startsWith: `RINV`,
};
export const invoice_item = {
  idLength: 5,
  startsWith: `IVI`,
};
export const payment = {
  idLength: 5,
  startsWith: `PY`,
};
export const payment_invoice = {
  idLength: 5,
  startsWith: `PYI`,
};
export const credit_notes = {
  idLength: 5,
  startsWith: `CN-${year}`,
  creditNotesStartsWith: `CRNT`,
};
export const credit_notes_item = {
  idLength: 5,
  startsWith: `CNI`,
};
