import DatabaseConnector from "../../DatabaseService/Connector.js";
import generateId from "../../utils/IDGenerator.js";
import { assertion } from "../../utils/helper.js";

class ContactPerson extends DatabaseConnector {
  constructor(table, idConfig) {
    super();
    this.table = table;
    this.idSize = idConfig?.idLength;
    this.idStartsWith = idConfig?.startsWith;
  }
  /**
   * Add contact person to DB via Common Module schema
   * @param {*} req
   * @param {*} res
   */
  async addContactPerson(contact, customer_id) {
    try {
      const response = await generateId({
        table: this.table,
        columns: [
          {
            column: "contact_id",
            startsWith: this.idStartsWith,
            count: contact?.length,
          },
        ],
        padStart: this.idSize,
      })
        .then(async (res) => {
          if (res.code === 200) {
            const contactData = this.getContactPersonArray(
              contact,
              customer_id,
              res.data?.max_unique_id
            );
            const result = await this.executeInsertQuery(
              this.table,
              contactData
            )
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
   * get formatted contact person array response
   * @param {*} contact
   * @param {*} customer_id
   * @param {*} contactId
   * @returns
   */
  getContactPersonArray(contact, customer_id, contactId) {
    const contactArray = contact.map((item, index) => {
      return {
        customer_id,
        contact_id: contactId?.[index],
        ...item,
      };
    });

    return contactArray;
  }
}

export default ContactPerson;
