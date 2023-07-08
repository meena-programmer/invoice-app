import DatabaseConnector from "../../DatabaseService/Connector.js";
import { mail_transporter, sender } from "../../config/mail_config.js";
import { assertion } from "../../utils/helper.js";
import assert from "node:assert";
import nodemailer from "nodemailer";

class SendInvoice extends DatabaseConnector {
  constructor(table) {
    super();
    this.table = table;
  }
  /**
   * this function send invoice to customer and update invoice status
   * @param {*} req
   * @param {*} res
   */
  async sendInvoice(req, res) {
    try {
      const { email_id, invoice_id, project_id } = req.body;

      assert(invoice_id, "Invoice ID required");

      this.executeSelectQuery(this.table, ["*"], {
        project_id,
        organization_id: req.organization_id,
      })
        .then(async (result) => {
          if (result.code === 200) {
            const isSent = await this.sendEmail(
              invoice_id,
              project_id,
              email_id,
              res,
              result.message.data?.[0]
            );
            if (isSent) {
              const response = await this.executeUpdateQuery(
                this.table,
                {
                  payment_status: "UNPAID",
                },
                {
                  project_id,
                }
              )
                .then((result) => result)
                .catch((error) => error);

              res.status(response.code).send(response.message);
            } else this.createErrorResponse({}, "Error Sending Invoice");
          } else res.status(result.code).send(result.message);
        })
        .catch((error) => res.status(error.code).send(error.message));
    } catch (e) {
      assertion(e, res);
    }
  }

  /**
   * this function send email to customer
   * @param {*} invoice_id
   * @param {*} project_id
   * @param {*} email_id
   * @param {*} invoice_data
   * @returns
   */
  async sendEmail(invoice_id, project_id, email_id, invoice_data) {
    const transporter = nodemailer.createTransport(mail_transporter);

    const mailOptions = {
      from: sender,
      to: email_id || sender,
      subject: `INVOICE-${invoice_id}`, // ex. invoice from organization..
      text: "test new- invoice_data", // formatted invoice data here...
    };

    const response = await transporter
      .sendMail(mailOptions)
      .then(() => true)
      .catch(() => false);

    return response;
  }
  /**
   * this common function handles the status of payment of invoice
   * @param {*} invoices
   * @returns
   */
  async changePaymentStatus(invoices = []) {
    if (invoices.length !== 0) {
      const dataToBeUpdate = [
        {
          column: "total",
          fields: invoices.map((item) => {
            return {
              condition: "project_id",
              condition_value: item.invoice_id,
              value: item.balance,
            };
          }),
        },
        {
          column: "payment_status",
          fields: invoices.map((item) => {
            return {
              condition: "project_id",
              condition_value: item.invoice_id,
              value: parseFloat(item.balance) === 0 ? "PAID" : "PARTIALLY PAID",
            };
          }),
        },
      ];

      const conditionStatement = {
        base: "project_id",
        data: invoices.map((item) => item.invoice_id),
      };

      const result = await this.executeUpdateQuery(
        this.table,
        dataToBeUpdate,
        conditionStatement,
        true
      )
        .then((result) => result)
        .catch((error) => error);

      return result;
    } else return this.createErrorResponse({}, "No Invoice selected");
  }
}

export default SendInvoice;
