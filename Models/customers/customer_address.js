import DatabaseConnector from "../../DatabaseService/Connector.js";
import generateId from "../../utils/IDGenerator.js";
import { assertion } from "../../utils/helper.js";

class CustomerAddress extends DatabaseConnector {
  constructor(table, idConfig) {
    super();
    this.table = table;
    this.idSize = idConfig?.idLength;
    this.idStartsWith = idConfig?.startsWith;
  }
  /**
   * Add customer address to DB via Common Module schema
   * @param {*} req
   * @param {*} res
   */
  async addCustomerAddress(address, customer_id) {
    try {
      const response = await generateId({
        table: this.table,
        columns: [
          {
            column: "address_id",
            startsWith: this.idStartsWith,
            count: address?.length,
          },
        ],
        padStart: this.idSize,
      })
        .then(async (res) => {
          if (res.code === 200) {
            const addresses = this.getAddressArray(
              address,
              customer_id,
              res.data?.max_unique_id
            );

            const result = await this.executeInsertQuery(this.table, addresses)
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
   * get formatted address array
   * @param {*} address
   * @param {*} customer_id
   * @param {*} addressId
   * @returns
   */
  getAddressArray(address, customer_id, addressId) {
    const addressArray = address.map((item, index) => {
      return {
        customer_id,
        address_id: addressId?.[index],
        ...item,
      };
    });

    return addressArray;
  }
}

export default CustomerAddress;
