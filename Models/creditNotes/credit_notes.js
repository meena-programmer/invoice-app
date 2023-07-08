import assert from "assert";
import DatabaseConnector from "../../DatabaseService/Connector.js";
import generateId from "../../utils/IDGenerator.js";
import { creditNotesTableRelation } from "../../utils/fetchingParams/creditNotesTable.js";
import { assertion, isObjectEmpty } from "../../utils/helper.js";
import { creditNotesRequestOrganizer } from "../../utils/organizer.js";

class CreditNotes extends DatabaseConnector {
  constructor(table, idConfig, creditNotesItemInstance) {
    super();
    this.creditNotesItemInstance = creditNotesItemInstance;

    this.table_name = table;
    this.idSize = idConfig?.idLength;
    this.idStartsWith = idConfig?.startsWith;
    this.creditNotesIdStartsWith = idConfig?.creditNotesStartsWith;
  }
  /**
   * Add credit notes to DB via Common Module schema
   * @param {*} req
   * @param {*} res
   */
  async addCreditNotes(req, res) {
    try {
      const { line_items = [] } = req.body;

      const creditNotesInfo = creditNotesRequestOrganizer(req);

      generateId({
        table: this.table_name,
        columns: [
          {
            column: "credit_notes_id",
            startsWith: this.idStartsWith,
            isCondition: true,
            condition: {
              organization_id: req.organization_id,
            },
          },
          {
            column: "project_id",
            startsWith: this.creditNotesIdStartsWith,
          },
        ],
        padStart: this.idSize,
      })
        .then((result) => {
          if (result.code === 200) {
            const project_id = result.data?.max_unique_id?.[0];
            const credit_notes_id = result.data?.max_id?.[0];

            this.executeInsertQuery(this.table_name, {
              ...creditNotesInfo,
              credit_notes_id,
              project_id,
            })
              .then(async (result2) => {
                const response = await this.handleResponse(
                  result2,
                  line_items,
                  project_id
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
   * handle credit notes response
   * @param {*} result2
   * @param {*} line_items
   * @param {*} credit_notes_id
   * @returns
   */
  async handleResponse(result2, line_items, credit_notes_id) {
    const result = {};
    const creditNotesItemsResult = {};
    if (line_items?.length > 0) {
      const creditNotesItems = await this.getCreditNotesItemsInfo(
        line_items,
        credit_notes_id
      );
      Object.assign(creditNotesItemsResult, {
        ...creditNotesItems,
      });
    }

    if (
      !isObjectEmpty(creditNotesItemsResult) &&
      creditNotesItemsResult.code !== 200
    ) {
      Object.assign(result, {
        code: creditNotesItemsResult.code,
        message: creditNotesItemsResult.message,
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
                  ...creditNotesItemsResult.message.data,
                },
              }
            : result2.message,
      });
    }

    return result;
  }
  /**
   * this function add credit note invoice item to DB via credit note item class
   * @param {*} line_items
   * @param {*} credit_notes_id
   * @returns
   */
  async getCreditNotesItemsInfo(line_items, credit_notes_id) {
    const creditNotesItemInfo = {};
    const response = await this.creditNotesItemInstance.addCreditNotesItem(
      line_items,
      credit_notes_id
    );

    if (response.code === 200) {
      const transformedData = response.message.data?.map(
        ({ id, project_id, ...rest }) => rest
      );

      Object.assign(creditNotesItemInfo, {
        code: response.code,
        message: {
          ...response.message,
          data: {
            line_items: transformedData,
          },
        },
      });
    } else return response;

    return creditNotesItemInfo;
  }

  /**
   * This function returns credit notes as per the credit notes id/organization id
   * @param {*} req
   * @param {*} res
   */
  getCreditNotes(req, res) {
    try {
      assert(req.organization_id, "User not logged in");

      const conditionStatement = {
        organization_id: req.organization_id,
        ...(req.query?.credit_notes_id && {
          credit_notes_id: req.query.credit_notes_id,
        }),
      };
      this.executeJoinSelectQuery(creditNotesTableRelation, conditionStatement)
        .then((result) => res.status(result.code).send(result.message))
        .catch((error) => res.status(error.code).send(error.message));
    } catch (e) {
      assertion(e, res);
    }
  }
}

export default CreditNotes;
