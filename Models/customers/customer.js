import assert from "assert";
import DatabaseConnector from "../../DatabaseService/Connector.js";
import generateId from "../../utils/IDGenerator.js";
import { customerTableRelation } from "../../utils/fetchingParams/customerTable.js";
import { assertion, isObjectEmpty } from "../../utils/helper.js";
import { customerRequestOrganizer } from "../../utils/organizer.js";

class Customer extends DatabaseConnector {
  constructor(table, idConfig, addressInstance, contactInstance) {
    super();
    this.addressInstance = addressInstance;
    this.contactInstance = contactInstance;

    this.table_name = table;
    this.idSize = idConfig?.idLength;
    this.idStartsWith = idConfig?.startsWith;
  }
  /**
   * Add customer to DB via Common Module schema
   * @param {*} req
   * @param {*} res
   */
  async addCustomer(req, res) {
    try {
      const {
        billing_address = {},
        shipping_address = {},
        contact_persons = [],
      } = req.body;
      const customerInfo = customerRequestOrganizer(req);

      const isAdditionInfo =
        !isObjectEmpty(shipping_address) ||
        !isObjectEmpty(billing_address) ||
        contact_persons?.length;

      generateId({
        table: this.table_name,
        columns: [
          {
            column: "customer_id",
            startsWith: this.idStartsWith,
          },
        ],
        padStart: this.idSize,
      })
        .then((result) => {
          if (result.code === 200) {
            const customer_id = result.data?.max_unique_id?.[0];

            this.executeInsertQuery(this.table_name, {
              ...customerInfo,
              customer_id,
            })
              .then(async (result2) => {
                const response = await this.handleResponse(
                  result2,
                  isAdditionInfo,
                  billing_address,
                  shipping_address,
                  contact_persons,
                  customer_id
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
   * handle customer response
   * @param {*} result2
   * @param {*} isAdditionInfo
   * @param {*} billing_address
   * @param {*} shipping_address
   * @param {*} contact_persons
   * @param {*} customer_id
   * @returns
   */
  async handleResponse(
    result2,
    isAdditionInfo,
    billing_address,
    shipping_address,
    contact_persons,
    customer_id
  ) {
    const result = {};
    const additionalCustomerInfo = {};
    if (isAdditionInfo) {
      const contactData = await this.getAdditionalCustomerInfo(
        billing_address,
        shipping_address,
        contact_persons,
        customer_id
      );
      Object.assign(additionalCustomerInfo, {
        ...contactData,
      });
    }

    if (isAdditionInfo && additionalCustomerInfo.code !== 200) {
      Object.assign(result, {
        code: additionalCustomerInfo.code,
        message: additionalCustomerInfo.message,
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
                  ...additionalCustomerInfo.message.data,
                },
              }
            : result2.message,
      });
    }
    return result;
  }
  /**
   * this function handles addition info such as customer address, contact person
   * @param {*} shipping_address
   * @param {*} billing_address
   * @param {*} contact_person
   * @param {*} customer_id
   * @returns
   */
  async getAdditionalCustomerInfo(
    shipping_address,
    billing_address,
    contact_person,
    customer_id
  ) {
    const address = [
      {
        address_type: "Shipping",
        ...shipping_address,
      },
      {
        address_type: "Billing",
        ...billing_address,
      },
    ];

    const response_address = await this.addressInstance.addCustomerAddress(
      address,
      customer_id
    );

    const response_contact = await this.contactInstance.addContactPerson(
      contact_person,
      customer_id
    );

    const address_d = this.handleAdditionalInfoResponse(
      response_address,
      "customer_address"
    );
    const contact_d = this.handleAdditionalInfoResponse(
      response_contact,
      "contact_person"
    );

    const otherInfo = {
      ...address_d,
      ...contact_d,
    };

    return {
      code: 200,
      message: {
        status: "success",
        data: {
          ...otherInfo,
        },
      },
    };
  }
  /**
   * handle additional info response
   * @param {*} response
   * @param {*} property
   * @returns
   */
  handleAdditionalInfoResponse(response, property) {
    const result = {};
    if (response.code === 200) {
      const transformedData = response.message.data?.map(
        ({ id, customer_id, ...rest }) => rest
      );

      Object.assign(result, {
        [property]: transformedData,
      });
    } else return response;

    return result;
  }
  /**
   * This function returns customer as per the customer id/organization id
   * @param {*} req
   * @param {*} res
   */
  getCustomers(req, res) {
    try {
      assert(req.organization_id, "User not logged in");

      const conditionStatement = {
        organization_id: req.organization_id,
        ...(req.query?.customer_id && { customer_id: req.query.customer_id }),
      };

      this.executeJoinSelectQuery(customerTableRelation, conditionStatement)
        .then((result) => res.status(result.code).send(result.message))
        .catch((error) => res.status(error.code).send(error.message));
    } catch (e) {
      assertion(e, res);
    }
  }
}

export default Customer;
