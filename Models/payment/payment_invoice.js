import DatabaseConnector from "../../DatabaseService/Connector.js";
import generateId from "../../utils/IDGenerator.js";
import { payment_invoice } from "../../utils/IDConfig.js";
import { assertion } from "../../utils/helper.js";

class PaymentInvoice extends DatabaseConnector {
  constructor(table, idConfig) {
    super();
    this.table = table;
    this.idSize = idConfig?.idLength;
    this.idStartsWith = idConfig?.startsWith;
  }
  /**
   * Add payment invoice to DB via Common Module schema
   * @param {*} req
   * @param {*} res
   */
  async addPaymentInvoices(invoices, payment_id) {
    try {
      const response = await generateId({
        table: this.table,
        columns: [
          {
            column: "payment_invoice_id",
            startsWith: this.idStartsWith,
          },
        ],
        padStart: this.idSize,
      })
        .then(async (res) => {
          if (res.code === 200) {
            const invoiceData = this.getPaymentInvoiceArray(
              invoices,
              payment_id,
              res.data?.max_unique_id
            );
            const result = await this.executeInsertQuery(
              this.table,
              invoiceData
            )
              .then((result) => result)
              .catch((error) => error);

            return result;
          }
          return res;
        })
        .catch((err) => err);

      return response;
    } catch (e) {
      assertion(e, res);
    }
  }

  /**
   * this function handles payment invoice transformmed array
   * @param {*} invoices
   * @param {*} payment_id
   * @param {*} payment_invoice_id
   * @returns
   */
  getPaymentInvoiceArray(invoices, payment_id, payment_invoice_id) {
    const paymentInvoice = {
      payment_id,
      payment_invoice_id: payment_invoice_id?.[0],
      ...invoices,
    };
    return paymentInvoice;
  }
}

export default PaymentInvoice;
