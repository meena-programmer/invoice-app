import assert from "assert";
import DatabaseConnector from "../../DatabaseService/Connector.js";
import generateId from "../../utils/IDGenerator.js";
import { assertion } from "../../utils/helper.js";

class Unit extends DatabaseConnector {
  constructor(table, idConfig) {
    super();
    this.table = table;
    this.idSize = idConfig?.idLength;
    this.idStartsWith = idConfig?.startsWith;
  }
  /**
   * Add item to DB via Common Module schema
   * @param {*} req
   * @param {*} res
   */
  async addUnit(data) {
    try {
      const { unit, unit_name = "" } = data;
      assert(unit, "Unit is required");

      const response = await generateId({
        table: this.table,
        columns: [
          {
            column: "unit_id",
            startsWith: this.idStartsWith,
          },
        ],
        padStart: this.idSize,
      })
        .then(async (res) => {
          if (res.code === 200) {
            const queryResponse = await this.executeInsertQuery(this.table, {
              unit,
              unit_name,
              unit_id: res.data?.max_unique_id?.[0],
            })
              .then((result) => result)
              .catch((error) => error);

            return queryResponse;
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
   * get unit data from DB
   * @param {*} unit
   * @param {*} returnItem
   * @returns
   */
  async getUnit(unit, returnItem) {
    const columns = returnItem || ["*"];
    const conditionStatement = {
      unit,
    };
    const response = await this.executeSelectQuery(
      this.table,
      columns,
      conditionStatement
    )
      .then((result) => result)
      .catch((error) => error);

    return response;
  }
}

export default Unit;
