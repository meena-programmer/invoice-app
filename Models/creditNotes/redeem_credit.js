import DatabaseConnector from "../../DatabaseService/Connector.js";
import assert, { strictEqual } from "assert";
import { assertion, isObjectEmpty } from "../../utils/helper.js";

class RedeemCredit extends DatabaseConnector {
  constructor(invoiceStatusUpdateInstance, invoiceTable, creditNotesTable) {
    super();
    this.invoiceStatusUpdateInstance = invoiceStatusUpdateInstance;
    this.invoice = invoiceTable;
    this.credit_notes = creditNotesTable;
  }
  /**
   * this function handle apply credits to invoice which means redeem invoice amount via credit_notes
   * @param {*} req
   * @param {*} res
   */
  async applyToInvoice(req, res) {
    try {
      const { credit_notes_id, invoices = [] } = req.body;
      assert(invoices, "Invoice is required");

      const invoice_result = await this.getInvoice(invoices);
      const credit_notes_result = await this.getCreditNotes(credit_notes_id);

      let response = {};

      if (invoice_result.code === 200 && credit_notes_result.code === 200) {
        const invoiceData = invoice_result.message.data;
        const creditNotesData = credit_notes_result.message.data;

        if (invoiceData?.length > 0 && creditNotesData?.length > 0) {
          const credit_amount = parseFloat(creditNotesData?.[0]?.total);

          const redeemResult = this.handleCreditsRedeem(
            invoices,
            invoiceData,
            credit_amount
          );

          response =
            redeemResult.code === 200
              ? await this.handleApplyToInvoice(
                  redeemResult.message.data,
                  invoices,
                  credit_notes_id,
                  credit_amount
                )
              : redeemResult;
        } else {
          response = this.handleNoDataFound(invoiceData, creditNotesData);
        }
      } else {
        response = this.handleError(invoice_result, credit_notes_result);
      }

      res.status(response.code).send(response.message);
    } catch (e) {
      assertion(e, res);
    }
  }
  /**
   * get invoice info from DB
   * @param {*} invoices
   * @returns
   */
  async getInvoice(invoices) {
    const invoice_result = await this.executeSelectQuery(
      this.invoice,
      ["total"],
      `project_id IN (${invoices
        .map((item) => `'${item.invoice_id}'`)
        .join(",")})`
    );

    return invoice_result;
  }
  /**
   * get credit notes info from DB
   * @param {*} credit_notes_id
   * @returns
   */

  async getCreditNotes(credit_notes_id) {
    const credit_notes_result = await this.executeSelectQuery(
      this.credit_notes,
      ["total"],
      {
        project_id: credit_notes_id,
      }
    );
    return credit_notes_result;
  }
  /**
   * handle error when trying to get invoice and credit notes info from DB
   * @param {*} invoice_result
   * @param {*} credit_notes_result
   * @returns
   */
  handleError(invoice_result, credit_notes_result) {
    let response = {};
    if (invoice_result.code !== 200)
      response = this.createSuccessResponse(
        invoice_result.code,
        invoice_result.message
      );
    else
      response = this.createSuccessResponse(
        credit_notes_result.code,
        credit_notes_result.message
      );

    return response;
  }
  /**
   * handleNoDataFound error when trying to get invoice and credit notes info from DB
   * @param {*} invoiceData
   * @param {*} creditNotesData
   * @returns
   */
  handleNoDataFound(invoiceData, creditNotesData) {
    let response = {};
    if (invoiceData?.length === 0) {
      response = {
        status: "Error",
        message: "No Data found in invoice",
      };
    } else if (creditNotesData?.length === 0) {
      response = {
        status: "Error",
        message: "No Data found in Credit Notes",
      };
    }

    return response;
  }
  /**
   * this function calculating balance invoice amount after redeem credits
   * @param {*} invoices
   * @param {*} invoiceData
   * @param {*} credit_amount
   * @returns
   */
  handleCreditsRedeem(invoices, invoiceData, credit_amount) {
    let response = {};

    const invoiceBalanceToUpdate = [];
    const incorrectData = [];

    invoices.forEach((item, index) => {
      const balance =
        parseFloat(invoiceData[index].total) - parseFloat(item.amount_applied);

      if (balance >= 0)
        invoiceBalanceToUpdate.push({
          invoice_id: item.invoice_id,
          balance,
        });
      else {
        incorrectData.push({
          message: this.generateErrorText(invoiceData[index], item),
        });
      }
    });

    if (incorrectData?.length === 0) {
      let totalCredit = 0;
      invoices.forEach((item) => {
        totalCredit = parseFloat(item.amount_applied) + parseFloat(totalCredit);
      });

      if (totalCredit > credit_amount)
        incorrectData.push({
          message: `Amount applied exceed than Credit limit`,
        });
    }
    const hasInvalid = incorrectData?.length > 0;

    response = {
      code: hasInvalid ? 500 : 200,
      message: {
        status: hasInvalid ? "Error" : "success",
        data: hasInvalid ? incorrectData : invoiceBalanceToUpdate,
      },
    };

    return response;
  }
  /**
   * this function handles apply credit to invoice
   * @param {*} redeemResult
   * @param {*} invoices
   * @param {*} credit_notes_id
   * @param {*} credit_amount
   * @returns
   */
  async handleApplyToInvoice(
    redeemResult,
    invoices,
    credit_notes_id,
    credit_amount
  ) {
    const dataToBeUpdate = [
      {
        column: "total",
        fields: redeemResult.map((item) => {
          return {
            condition: "project_id",
            condition_value: item.invoice_id,
            value: item.balance,
          };
        }),
      },
      {
        column: "payment_status",
        fields: redeemResult.map((item) => {
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
      data: redeemResult.map((item) => item.invoice_id),
    };

    let totalRedeem = 0;
    invoices.forEach((item) => {
      totalRedeem = parseFloat(totalRedeem) + parseFloat(item.amount_applied);
    });

    // update invoice
    let creditUpdateResult = {};
    const result = await this.invoiceStatusUpdateInstance
      .changePaymentStatus(redeemResult)
      .then(async (res) => {
        if (res.code === 200) {
          const credit_balance = credit_amount - totalRedeem;
          // update credit notes
          const creditResult = await this.executeUpdateQuery(
            this.credit_notes,
            {
              total: credit_balance,
              ...(credit_balance === 0 && { status: "close" }),
            },
            {
              project_id: credit_notes_id,
            }
          );
          if (creditResult.code === 200)
            creditUpdateResult = creditResult.message.data;
          else return creditResult;
        }
        return res;
      })
      .catch((err) => err);

    return {
      code: 200,
      message: {
        data: {
          invoice: result.message.data,
          ...(!isObjectEmpty(creditUpdateResult) && { creditUpdateResult }),
        },
      },
    };
  }

  generateErrorText = (invoiceData, input) =>
    `An error has occurred while processing the invoice with ID ${input.invoice_id}. The total amount of the invoice is ${invoiceData.total}, but the credit applied exceeds this amount with a value of ${input.amount_applied}. This indicates that more credit has been utilized than necessary for this particular invoice.`;
}

export default RedeemCredit;
