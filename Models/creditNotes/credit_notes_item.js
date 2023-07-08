import InvoiceItem from "../invoice/invoice_item.js";

class CreditNotesItem extends InvoiceItem {
  constructor(table, idConfig) {
    super(table, idConfig);
  }
  /**
   * this function add credit invoice item to DB via invoice class
   * @param {*} line_items
   * @param {*} credit_notes_id
   * @returns
   */
  async addCreditNotesItem(line_items, credit_notes_id) {
    const result = await this.addInvoiceItems(
      line_items,
      credit_notes_id,
      "credit_notes_id"
    );

    return result;
  }
}

export default CreditNotesItem;
