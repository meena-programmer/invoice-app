import DatabaseConnector from "../../DatabaseService/Connector.js";
import generateId from "../../utils/IDGenerator.js";
import { assertion } from "../../utils/helper.js";

class InvoiceItem extends DatabaseConnector {
  constructor(table, idConfig) {
    super();
    this.table = table;
    this.idSize = idConfig?.idLength;
    this.idStartsWith = idConfig?.startsWith;
  }
  /**
   * Add invoice item to DB via Common Module schema
   * @param {*} req
   * @param {*} res
   */
  async addInvoiceItems(items, id, key = "invoice_id") {
    try {
      const response = await generateId({
        table: this.table,
        columns: [
          {
            column: "line_item_id",
            startsWith: this.idStartsWith,
            count: items?.length,
          },
        ],
        padStart: this.idSize,
      })
        .then(async (res) => {
          if (res.code === 200) {
            const itemData = this.getInvoiceItemArray(
              items,
              id,
              res.data?.max_unique_id,
              key
            );

            const result = await this.executeInsertQuery(this.table, itemData)
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
   * this function formatting array of invoice item
   * @param {*} items
   * @param {*} id
   * @param {*} line_item_id
   * @param {*} key
   * @returns
   */
  getInvoiceItemArray(items, id, line_item_id, key) {
    const itemsArray = items.map((item, index) => {
      return {
        [key]: id,
        line_item_id: line_item_id?.[index],
        ...item,
      };
    });

    return itemsArray;
  }
}

export default InvoiceItem;
