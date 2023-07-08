import assert from "assert";
import DatabaseConnector from "../../DatabaseService/Connector.js";
import generateId from "../../utils/IDGenerator.js";
import { invoiceTableRelation } from "../../utils/fetchingParams/invoiceTable.js";
import { assertion, isObjectEmpty } from "../../utils/helper.js";
import { invoiceRequestOrganizer } from "../../utils/organizer.js";

class Invoice extends DatabaseConnector {
  constructor(
    table,
    idConfig,
    invoiceItemInstance,
    recurringInvoiceInstance,
    invoice_type = "invoice"
  ) {
    super();
    this.invoiceItemInstance = invoiceItemInstance;
    this.recurringInvoiceInstance = recurringInvoiceInstance;

    this.table_name = table;
    this.idSize = idConfig?.idLength;
    this.idStartsWith = idConfig?.startsWith;
    this.invoice_startsWith = idConfig?.invoice_startsWith;
    this.invoice_type = invoice_type;
  }
  /**
   * Add invoice to DB via Common Module schema
   * @param {*} req
   * @param {*} res
   */
  async addInvoice(req, res) {
    try {
      const { line_items = [] } = req.body;

      const { invoiceInfo, recurringInvoiceInfo } = invoiceRequestOrganizer(
        req,
        this.invoice_type
      );

      generateId({
        table: this.table_name,
        columns: [
          {
            column: "invoice_id",
            startsWith: this.idStartsWith,
            isCondition: true,
            condition: {
              organization_id: req.organization_id,
            },
          },
          {
            column: "project_id",
            startsWith: this.invoice_startsWith,
          },
        ],
        padStart: this.idSize,
      })
        .then((result) => {
          if (result.code === 200) {
            const project_id = result.data?.max_unique_id?.[0];
            const invoice_id = result.data?.max_id?.[0];

            this.executeInsertQuery(this.table_name, {
              ...invoiceInfo,
              ...(this.invoice_type !== "invoice" && {
                payment_status: "UNPAID",
              }),
              invoice_id,
              project_id,
            })
              .then(async (result2) => {
                const response = await this.handleResponse(
                  result2,
                  line_items,
                  project_id,
                  recurringInvoiceInfo,
                  req.organization_id
                );
                res.status(response.code).send(response.message);
              })
              .catch((error2) => res.status(error2.code).send(error2.message));
          }
        })
        .catch((err) => res.status(err.code).send(err.message));
    } catch (e) {
      assertion(e, res);
    }
  }
  /**
   * handle invoice response
   * @param {*} result2
   * @param {*} line_items
   * @param {*} project_id
   * @param {*} recurringInvoiceInfo
   * @param {*} organization_id
   * @returns
   */
  async handleResponse(
    result2,
    line_items,
    project_id,
    recurringInvoiceInfo,
    organization_id
  ) {
    const result = {};
    // INVOICE ITEMS INFO
    const lineItemResult = {};
    if (line_items?.length > 0) {
      const lineItems = await this.getLineItemInfo(line_items, project_id);
      Object.assign(lineItemResult, {
        ...lineItems,
      });
    }
    // RECURRING INVOICE INFO
    const recurringInvoiceResult = {};
    if (this.invoice_type === "recurring_invoice") {
      const recurringInvoice = await this.getRecurringInvoiceInfo(
        recurringInvoiceInfo,
        project_id,
        organization_id
      );
      Object.assign(recurringInvoiceResult, {
        ...recurringInvoice,
      });
    }

    if (!isObjectEmpty(lineItemResult) && lineItemResult.code !== 200) {
      Object.assign(result, {
        code: lineItemResult.code,
        message: lineItemResult.message,
      });
    } else if (
      !isObjectEmpty(recurringInvoiceResult) &&
      recurringInvoiceResult.code !== 200
    ) {
      Object.assign(result, {
        code: recurringInvoiceResult.code,
        message: recurringInvoiceResult.message,
      });
    } else {
      Object.assign(result, {
        code: result2.code,
        message:
          result2.code === 200
            ? {
                ...result2.message,
                data: {
                  ...result2.message.data?.[0],
                  ...(!isObjectEmpty(lineItemResult) && {
                    ...lineItemResult.message.data,
                    ...recurringInvoiceResult?.message?.data,
                  }),
                },
              }
            : result2.message,
      });
    }

    return result;
  }
  /**
   * this function add invoice item to DB via invoice_item class
   * @param {*} line_items
   * @param {*} project_id
   * @returns
   */
  async getLineItemInfo(line_items, project_id) {
    const invoiceItemsInfo = {};

    const response = await this.invoiceItemInstance.addInvoiceItems(
      line_items,
      project_id
    );

    Object.assign(invoiceItemsInfo, {
      ...this.handleAdditionInfoResponse(response),
    });

    return invoiceItemsInfo;
  }
  /**
   * this function add recurring invoice to DB via recurring invoice class
   * @param {*} invoice
   * @param {*} project_id
   * @param {*} organization_id
   * @returns
   */
  async getRecurringInvoiceInfo(invoice, project_id, organization_id) {
    const recurringInvoiceItemsInfo = {};

    const response = await this.recurringInvoiceInstance.addRecurringInvoice(
      invoice,
      project_id,
      organization_id
    );

    Object.assign(recurringInvoiceItemsInfo, {
      ...this.handleAdditionInfoResponse(response),
    });

    return recurringInvoiceItemsInfo;
  }

  /**
   * this function handles formatting data of invoice
   * @param {*} response
   * @returns
   */
  handleAdditionInfoResponse(response) {
    const resultInfo = {};

    if (response.code === 200) {
      const transformedData = response.message.data?.map(
        ({ id, project_id, ...rest }) => rest
      );

      Object.assign(resultInfo, {
        code: response.code,
        message: {
          ...response.message,
          data: {
            line_items: transformedData,
          },
        },
      });
    } else return response;

    return resultInfo;
  }

  /**
   * This function returns invoice as per the project id/organization id
   * @param {*} req
   * @param {*} res
   */
  getInvoices(req, res) {
    try {
      assert(req.organization_id, "User not logged in");

      const conditionStatement = {
        organization_id: req.organization_id,
        ...(req.query?.invoice_id && { invoice_id: req.query.invoice_id }),
      };
      this.executeJoinSelectQuery(invoiceTableRelation, conditionStatement)
        .then((result) => res.status(result.code).send(result.message))
        .catch((error) => res.status(error.code).send(error.message));
    } catch (e) {
      assertion(e, res);
    }
  }
}
export default Invoice;
