import assert from "assert";
import DatabaseConnector from "../../DatabaseService/Connector.js";
import generateId from "../../utils/IDGenerator.js";
import { payment } from "../../utils/IDConfig.js";
import { paymentTableRelation } from "../../utils/fetchingParams/paymentTable.js";
import { assertion, isObjectEmpty } from "../../utils/helper.js";
import { paymentRequestOrganizer } from "../../utils/organizer.js";

class Payment extends DatabaseConnector {
  constructor(
    table,
    idConfig,
    paymentInvoiceInstance,
    invoiceStatusUpdateInstance
  ) {
    super();
    this.paymentInvoiceInstance = paymentInvoiceInstance;
    this.invoiceStatusUpdateInstance = invoiceStatusUpdateInstance;
    this.table_name = table;
    this.idSize = idConfig?.idLength;
    this.idStartsWith = idConfig?.startsWith;
  }
  /**
   * Add Payment to DB via Common Module schema
   * @param {*} req
   * @param {*} res
   */
  async addPayment(req, res) {
    try {
      const { invoices = {} } = req.body;

      const paymentInfo = paymentRequestOrganizer(req);

      const checkAmountInfo = this.checkPaymentAmountToInvoice(
        paymentInfo.amount,
        invoices.amount
      );

      if (checkAmountInfo) {
        await this.paymentProcess(paymentInfo, invoices, res);
      } else {
        this.handleExceedAmountError(paymentInfo.amount, invoices.amount, res);
      }
    } catch (e) {
      assertion(e, res);
    }
  }

  /**
   * this function handle payment process of insertion
   * @param {*} paymentInfo
   * @param {*} invoices
   * @param {*} res
   */
  async paymentProcess(paymentInfo, invoices, res) {
    generateId({
      table: this.table_name,
      columns: [
        {
          column: "payment_id",
          startsWith: this.idStartsWith,
        },
      ],
      padStart: this.idSize,
    })
      .then((result) => {
        if (result.code === 200) {
          const payment_id = result.data?.max_unique_id?.[0];
          this.executeInsertQuery(this.table_name, {
            ...paymentInfo,
            payment_id,
          })
            .then(async (result2) => {
              const response = await this.handleResponse(
                result2,
                invoices,
                payment_id
              );
              if (response.code === 200) {
                const invoiceStatus = await this.updateInvoiceStatus(
                  paymentInfo,
                  invoices
                );
                if (invoiceStatus.code === 200)
                  res.status(response.code).send(response.message);
                else res.status(invoiceStatus.code).send(invoiceStatus.message);
              } else res.status(response.code).send(response.message);
            })
            .catch((error2) => res.status(error2.code).send(error2.message));
        }
      })
      .catch((err) => res.status(err.code).send(err.message));
  }

  /**
   * this function handles the payment response
   * @param {*} result2
   * @param {*} invoices
   * @param {*} payment_id
   * @returns
   */
  async handleResponse(result2, invoices, payment_id) {
    const result = {};
    const invoicesResult = {};
    if (!isObjectEmpty(invoices)) {
      const paymentInvoices = await this.getPaymentInvoiceInfo(
        invoices,
        payment_id
      );
      Object.assign(invoicesResult, {
        ...paymentInvoices,
      });
    }

    if (!isObjectEmpty(invoicesResult) && invoicesResult.code !== 200) {
      Object.assign(result, {
        code: invoicesResult.code,
        message: invoicesResult.message,
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
                  ...invoicesResult.message.data,
                },
              }
            : result2.message,
      });
    }

    return result;
  }

  /**
   * this function add payment invoices to DB via payment invoice class
   * @param {*} invoices
   * @param {*} payment_id
   * @returns
   */
  async getPaymentInvoiceInfo(invoices, payment_id) {
    const paymentInvoicesInfo = {};

    const response = await this.paymentInvoiceInstance.addPaymentInvoices(
      invoices,
      payment_id
    );

    if (response.code === 200) {
      const transformedData = response.message.data?.map(
        ({ id, payment_id, ...rest }) => rest
      );

      Object.assign(paymentInvoicesInfo, {
        code: response.code,
        message: {
          ...response.message,
          data: {
            invoices: transformedData,
          },
        },
      });
    } else return response;

    return paymentInvoicesInfo;
  }

  /**
   * check payment amount with invoice amount
   * @param {*} paymentInfoAmount
   * @param {*} invoicesAmount
   * @returns
   */
  checkPaymentAmountToInvoice(paymentInfoAmount, invoicesAmount) {
    return parseFloat(paymentInfoAmount) <= parseFloat(invoicesAmount);
  }
  /**
   * if payment amount exceed to invoice amount returns error
   * @param {*} paymentAmount
   * @param {*} invoiceAmount
   * @param {*} res
   */
  handleExceedAmountError(paymentAmount, invoiceAmount, res) {
    res.status(500).send({
      message: {
        status: "Error",
        data: `An error has occurred during the payment process. The payment amount of ${paymentAmount} exceeds the total amount of the invoice bill, which is ${invoiceAmount}. This indicates that the payment amount surpasses the expected bill amount.`,
      },
    });
  }

  /**
   * this function handle invoice status
   * @param {*} paymentInfo
   * @param {*} invoices
   * @returns
   */
  async updateInvoiceStatus(paymentInfo, invoices) {
    const invoiceBalance =
      parseFloat(invoices.amount) - parseFloat(paymentInfo.amount);

    const dataToBeUpdate = [
      {
        invoice_id: invoices.invoice_id,
        balance: invoiceBalance,
      },
    ];
    const result = await this.invoiceStatusUpdateInstance
      .changePaymentStatus(dataToBeUpdate)
      .then((result) => result)
      .catch((error) => error);

    return result;
  }
  /**
   * This function returns payment as per the payment id/organization id
   * @param {*} req
   * @param {*} res
   */
  getPayments(req, res) {
    try {
      assert(req.organization_id, "User not logged in");

      const conditionStatement = {
        organization_id: req.organization_id,
        ...(req.query?.payment_id && { payment_id: req.query.payment_id }),
      };
      this.executeJoinSelectQuery(paymentTableRelation, conditionStatement)
        .then((result) => res.status(result.code).send(result.message))
        .catch((error) => res.status(error.code).send(error.message));
    } catch (e) {
      assertion(e, res);
    }
  }
}

export default Payment;
