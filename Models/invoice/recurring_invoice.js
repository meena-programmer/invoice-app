import assert from "assert";
import DatabaseConnector from "../../DatabaseService/Connector.js";
import generateId from "../../utils/IDGenerator.js";
import { assertion } from "../../utils/helper.js";
import { scheduleCronJob } from "../../utils/cronJob.js";

class RecurringInvoice extends DatabaseConnector {
  constructor(table, idConfig, InvoiceStatusUpdate) {
    super();
    this.InvoiceStatusUpdate = InvoiceStatusUpdate;
    this.table = table;
    this.idSize = idConfig?.idLength;
    this.idStartsWith = idConfig?.startsWith;
  }
  /**
   * Add recurring invoice to DB via Common Module schema
   * @param {*} req
   * @param {*} res
   */
  async addRecurringInvoice(data, invoice_id, organization_id) {
    try {
      const {
        customer_id,
        recurrance_name,
        recurrance_start,
        recurrance_end,
        repeat_every,
        recurrance_frequency,
        total,
        status = "Active",
      } = data;
      assert(recurrance_name, "Recurrance Name is required");

      const recurranceInfo = {
        recurrance_end,
        recurrance_frequency,
        recurrance_name,
        recurrance_start,
        repeat_every,
        total,
        recurrance_count: 0,
        status,
      };

      const customerInfoResponse = await this.executeSelectQuery(
        "customer",
        ["*"],
        {
          customer_id,
          organization_id,
        }
      );
      if (customerInfoResponse.code === 200) {
        const response = await generateId({
          table: this.table,
          columns: [
            {
              column: "recurrance_id",
              startsWith: this.idStartsWith,
            },
          ],
          padStart: this.idSize,
        })
          .then(async (res) => {
            if (res.code === 200) {
              const queryResponse = await this.executeInsertQuery(this.table, {
                ...recurranceInfo,
                invoice_id: invoice_id,
                recurrance_id: res.data?.max_unique_id?.[0],
              })
                .then(async (result) => {
                  if (result.code === 200) {
                    const isSend = await this.scheduleJob(
                      invoice_id,
                      customerInfoResponse.message.data?.[0],
                      result.message.data?.[0]
                    );

                    return isSend
                      ? result
                      : this.createErrorResponse({}, "Error Sending Invoice");
                  } else return result;
                })
                .catch((error) => error);

              return queryResponse;
            }
            return res;
          })
          .catch((err) => err);

        return response;
      } else customerInfoResponse;
    } catch (e) {
      assertion(e, res);
    }
  }

  /**
   * this function schedule recurring invoice for customer of particular frequency and send email
   * @param {*} invoice_id
   * @param {*} customerInfo
   * @param {*} recurranceInfo
   * @returns
   */
  async scheduleJob(invoice_id, customerInfo, recurranceInfo) {
    const isSend = true;
    await this.InvoiceStatusUpdate.sendEmail(
      invoice_id,
      invoice_id,
      customerInfo?.email
    );
    const {
      repeat_every,
      recurrance_frequency,
      recurrance_start,
      recurrance_end,
    } = recurranceInfo;

    scheduleCronJob(
      recurrance_frequency,
      repeat_every,
      recurrance_start,
      recurrance_end,
      invoice_id
    );

    return isSend;
  }
}

export default RecurringInvoice;
