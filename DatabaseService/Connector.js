import { getConnection } from "./Connection.js";
import mysql from "mysql2";

class DatabaseConnector {
  /**
   * Common method for database services
   * @param {*} query
   * @param {*} values
   * @returns query result => success || error
   */
  async executeQuery(query, values = []) {
    try {
      const connection = await getConnection();

      const result = await new Promise((resolve, reject) => {
        connection.query(query, values, (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        });
      });

      return result;
    } catch (error) {
      throw error;
    }
  }

  createSuccessResponse(data = "", message = "") {
    return {
      code: 200,
      message: {
        status: "success",
        data,
        message,
      },
    };
  }
  createErrorResponse(error = {}, msg = "", table) {
    let errno = error.errno;
    let code = typeof error?.code === "number" ? error.code : 500;
    let message = error?.sqlMessage || error?.message || msg;
    let status = "error";
    if (errno === 1452 || errno === 1453) {
      code = 400;
      status = "Dependency Error";
      console.log(table);
      if (
        table === "item" ||
        table === "unit" ||
        table.startsWith("customer") ||
        table === "contact_person"
      )
        message = "Check if organization_id in header or create new one";
      if (
        table.startsWith("invoice") ||
        table === "tax" ||
        table.startsWith("credit_notes") ||
        table.startsWith("recurring_invoice")
      )
        message =
          "Check if organization_id in header or create new one/ item / customer doesn't exist";
      if (table.startsWith("payment"))
        message =
          "Check if organization_id in header or create new one/ invoice doesn't exist";
    }
    return {
      code,
      message: {
        status,
        message,
      },
    };
  }

  /**
   * Common method for handling insert query
   * @param {*} table
   * @param {*} dataItems
   * @returns
   */
  async executeInsertQuery(table, dataItems, returnItem) {
    try {
      let columns = "",
        values = [],
        placeholders = "?";

      let isMultiple = Array.isArray(dataItems);

      if (isMultiple) {
        columns = Object.keys(dataItems?.[0]).join(",");
        dataItems.forEach((item) => {
          values.push(Object.values(item));
        });
      } else {
        columns = Object.keys(dataItems).join(",");
        values = Object.values(dataItems);
        placeholders = `(${values.map(() => "?").join(",")})`;
      }

      const query = `INSERT INTO ${table} (${columns}) VALUES ${placeholders}`;

      const result = await this.executeQuery(
        query,
        isMultiple ? [values] : values
      );
      if (result.insertId > 0) {
        const requiredColumns = returnItem?.length ? [...returnItem] : ["*"];

        const insertedIds = [];

        for (let i = 0; i < result.affectedRows; i++) {
          insertedIds.push(result.insertId + i);
        }

        const response = await this.executeSelectQuery(
          table,
          requiredColumns,
          `id IN (${insertedIds.join(",")})`
        )
          .then((res) => res)
          .catch((error) => error);
        if (response.code === 200)
          return this.createSuccessResponse(
            response.message.data,
            "Record added successfully"
          );
        else return this.createErrorResponse(response);
      } else {
        return this.createErrorResponse(result, "", table);
      }
    } catch (error) {
      return this.createErrorResponse(error, "", table);
    }
  }
  /**
   * Common method for handling update queries
   * @param {*} table
   * @param {*} updateData
   * @param {*} whereCondition
   * @returns
   */
  async executeUpdateQuery(
    table,
    updateData,
    whereCondition,
    isMultipleUpdate = false,
    returnItem
  ) {
    try {
      const updateValues = isMultipleUpdate
        ? updateData
            .map((item) => {
              return `${item.column} = CASE${item.fields
                .map((item) => {
                  const { value, condition, condition_value } = item;
                  return ` WHEN ${condition}= "${condition_value}" THEN "${value}"`;
                })
                .join(" ")} ELSE ${item.column} END`;
            })
            .join(",")
        : Object.entries(updateData)
            .map(([key, value]) => {
              if (key === "expiry_time") {
                return `${key} = ${value}`; // No need to escape the value for expiry_time
              }
              return `${key} = ${mysql.escape(value)}`;
            })
            .join(", ");

      const whereClause = isMultipleUpdate
        ? `${whereCondition.base} IN (${whereCondition.data
            .map((item) => `"${item}"`)
            .join(",")})`
        : Object.entries(whereCondition)
            .map(([key, value]) => `${key} = ${mysql.escape(value)}`)
            .join(" AND ");

      const query = `UPDATE ${table} SET ${updateValues} WHERE ${whereClause};`;
      const result = await this.executeQuery(query);

      if (result.affectedRows > 0) {
        const requiredColumns = returnItem?.length ? [...returnItem] : ["*"];

        const response = await this.executeSelectQuery(
          table,
          requiredColumns,
          isMultipleUpdate ? isMultipleUpdate : whereCondition
        )
          .then((res) => res)
          .catch((error) => error);

        if (response.code === 200)
          return this.createSuccessResponse(
            response.message.data,
            "Record updated successfully"
          );
        else return this.createErrorResponse(response);
      } else {
        return this.createErrorResponse(result);
      }
    } catch (error) {
      return this.createErrorResponse(error);
    }
  }
  /**
   * Common method for handling select queries
   * @param {*} table
   * @param {*} columns
   * @param {*} whereCondition
   * @returns
   */
  async executeSelectQuery(table, columns, whereCondition) {
    try {
      const selectColumns = columns.join(", ");
      const isWhereCondition = whereCondition !== undefined;
      let whereClause = null;
      if (isWhereCondition) {
        if (typeof whereCondition === "string") whereClause = whereCondition;
        else
          whereClause = Object.entries(whereCondition)
            .map(([key, value]) => `${key} = ${mysql.escape(value)}`)
            .join(" AND ");
      }

      const where = whereClause ? `WHERE ${whereClause}` : "";

      const query = `SELECT ${selectColumns} FROM ${table} ${where}`;
      const result = await this.executeQuery(query);
      return this.createSuccessResponse(result, "Record retrieved");
    } catch (error) {
      return this.createErrorResponse(error);
    }
  }
  /**
   * Common method for handling delete queries
   * @param {*} table
   * @param {*} whereCondition
   * @returns
   */
  async executeDeleteQuery(table, whereCondition) {
    try {
      const whereClause = Object.entries(whereCondition)
        .map(([key, value]) => `${key} = ${mysql.escape(value)}`)
        .join(" AND ");

      const query = `DELETE FROM ${table} WHERE ${whereClause}`;

      const result = await this.executeQuery(query);

      if (result.affectedRows > 0) {
        return this.createSuccessResponse("", "Record Deleted successfully");
      } else {
        return this.createErrorResponse(result, "No Records to delete");
      }
    } catch (error) {
      return this.createErrorResponse(error);
    }
  }

  generateColumn(columns, table) {
    return columns.map((column) => `'${column}', ${table}.${column}`).join(",");
  }
  executeSubRelationQueries(subTable, main) {
    return subTable
      .map(
        (sub) =>
          `'${
            sub.main.table
          }_details',(SELECT JSON_ARRAYAGG(JSON_OBJECT(${this.generateColumn(
            sub.main.columns,
            sub.main.table
          )}
        ${
          sub?.sub
            ? `, ${this.executeSubRelationQueries(sub.sub, sub.main)}`
            : ""
        }
        ) )FROM ${sub.main.table} WHERE ${sub.main.table}.${
            sub.main.unique_key
          } = ${main.table}.${main[`${sub.main.table}_key`]})`
      )
      .join(",");
  }
  executeSubQueries(subTable, main) {
    return subTable
      .map(
        (sub) =>
          `(SELECT JSON_ARRAYAGG(JSON_OBJECT(${this.generateColumn(
            sub.main.columns,
            sub.main.table
          )}
          ${
            sub?.sub
              ? `, ${this.executeSubRelationQueries(sub.sub, sub.main)}`
              : ""
          }
          )) FROM ${sub.main.table} WHERE ${sub.main.table}.${
            sub.main.unique_key
          } = ${main.table}.${main[`${sub.main.table}_key`]}) AS ${
            sub.main.table
          }`
      )
      .join(",");
  }
  generateJoin(subTable, mainTable) {
    return subTable
      .map(
        (sub) =>
          `LEFT JOIN ${sub.main.table} ON ${sub.main.table}.${
            sub.main.unique_key
          } = ${mainTable.table}.${mainTable[`${sub.main.table}_key`]}`
      )
      .join(" ");
  }

  async executeJoinSelectQuery(table, whereCondition) {
    try {
      const mainTable = table.main.table;
      const mainKey = table.main.unique_key;

      const subQuery = table?.sub
        ? this.executeSubQueries(table.sub, table.main)
        : "";
      const joins = table?.sub ? this.generateJoin(table.sub, table.main) : "";

      const whereClause = whereCondition
        ? ` WHERE ${Object.entries(whereCondition)
            .map(
              ([key, value]) => `${mainTable}.${key} = ${mysql.escape(value)}`
            )
            .join(" AND ")}`
        : "";

      const query = `SELECT ${mainTable}.* ${
        subQuery ? `,${subQuery}` : ""
      } FROM ${mainTable} ${joins} ${whereClause} GROUP BY ${mainTable}.${mainKey};`;

      const result = await this.executeQuery(query);

      return this.createSuccessResponse(result, "Record retrieved");
    } catch (error) {
      return this.createErrorResponse(error);
    }
  }
}
export default DatabaseConnector;
