import assert from "assert";
import DatabaseConnector from "../../DatabaseService/Connector.js";
import generateId from "../../utils/IDGenerator.js";
import { itemTableRelation } from "../../utils/fetchingParams/ItemTable.js";
import { assertion } from "../../utils/helper.js";
import { itemRequestOrganizer } from "../../utils/organizer.js";

class Item extends DatabaseConnector {
  constructor(table, idConfig, unitInstance) {
    super();
    this.unitInstance = unitInstance;
    this.table_name = table;
    this.idSize = idConfig?.idLength;
    this.idStartsWith = idConfig?.startsWith;
  }
  /**
   * Add item to DB via Common Module schema
   * @param {*} req
   * @param {*} res
   */
  async addItem(req, res) {
    try {
      const { unit = "" } = req.body;

      const itemData = itemRequestOrganizer(req);

      const unitInfo = {};
      if (unit !== "") {
        const result = await this.getUnitInfo(unit);
        if (result.code === 200 && result.message.data?.length > 0) {
          Object.assign(itemData, {
            ...itemData,
            unit_id: result.message.data?.[0]?.unit_id,
          });
          Object.assign(unitInfo, { ...result.message.data?.[0] });
        } else {
          res.status(result.code).send(result.message);
          return;
        }
      }

      generateId({
        table: this.table_name,
        columns: [
          {
            column: "item_id",
            startsWith: this.idStartsWith,
          },
        ],
        padStart: this.idSize,
      })
        .then((result) => {
          if (result.code === 200) {
            this.executeInsertQuery(this.table_name, {
              ...itemData,
              item_id: result.data?.max_unique_id?.[0],
            })
              .then((result2) =>
                res.status(result2.code).send(
                  result2.code === 200
                    ? {
                        ...result2.message,
                        data: {
                          ...result2.message.data?.[0],
                          ...unitInfo,
                        },
                      }
                    : result2.message
                )
              )
              .catch((error2) => res.status(error2.code).send(error2.message));
          }
        })
        .catch((err) => res.status(err.code).send(err.message));
    } catch (e) {
      assertion(e, res);
    }
  }

  /**
   * This function returns items as per the item id/organization id
   * @param {*} req
   * @param {*} res
   */
  getItems(req, res) {
    try {
      assert(req.organization_id, "User not logged in");

      const conditionStatement = {
        organization_id: req.organization_id,
        ...(req.query?.item_id && { item_id: req.query.item_id }),
      };
      this.executeJoinSelectQuery(itemTableRelation, conditionStatement)
        .then((result) => res.status(result.code).send(result.message))
        .catch((error) => res.status(error.code).send(error.message));
    } catch (e) {
      assertion(e, res);
    }
  }

  /**
   * UNIT not null while adding new item
   * check unit available in unit table
   * if available get unit id and assign to item data
   * if not insert new unit to unit table and returns it to add in item
   * @param {*} unit
   */
  async getUnitInfo(unit) {
    const selectResult = await this.unitInstance.getUnit(unit);
    if (selectResult.code === 200) {
      if (selectResult.message.data?.length > 0) {
        return selectResult;
      } else {
        const addResult = await this.unitInstance.addUnit({ unit });
        return addResult;
      }
    }
    return selectResult;
  }
}

export default Item;
