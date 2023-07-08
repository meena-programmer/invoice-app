import assert, { strictEqual } from "assert";
import { compareSync, hashSync } from "bcrypt";
import jwt from "jsonwebtoken";
import DatabaseConnector from "../DatabaseService/Connector.js";
import generateId from "../utils/IDGenerator.js";
import { assertion } from "../utils/helper.js";
import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

class User extends DatabaseConnector {
  constructor(table, idConfig) {
    super();
    this.table = table;
    this.idSize = idConfig?.idLength;
    this.idStartsWith = idConfig?.startsWith;
  }
  /**
   * Add user to DB via Common Module schema
   * @param {*} req
   * @param {*} res
   */
  addUser(req, res) {
    try {
      assert(req.body.name, "Name is required");
      assert(req.body.mobile, "Mobile is required");
      assert(req.body.password, "Password is required");
      assert(req.body.confirmPassword, "Confirm Password is required");
      assert(req.body.companyName, "Company Name is required");
      assert(req.body.email, "Email ID is required");

      strictEqual(
        req.body.password,
        req.body.confirmPassword,
        "Password and Confirm Password don't match"
      );

      const userData = {
        name: req.body.name,
        mobile: req.body.mobile,
        password: hashSync(req.body.password, 10),
        company_name: req.body.companyName,
        company_website: req.body.company_website
          ? req.body.company_website
          : "",
        email: req.body.email,
        company_address: req.body.hasOwnProperty("company_address")
          ? req.body.company_address
          : "",
      };

      const returnItem = [
        "id",
        "mobile",
        "created_on",
        "updated_on",
        "email",
        "name",
        "company_name",
        "company_website",
        "auth_token",
        "expiry_time",
        "company_address",
        "organization_id",
      ];

      generateId({
        table: this.table,
        columns: [
          {
            column: "organization_id",
            startsWith: this.idStartsWith,
          },
        ],
        padStart: this.idSize,
      })
        .then((result) => {
          if (result.code === 200) {
            this.executeInsertQuery(
              this.table,
              { ...userData, organization_id: result.data?.max_unique_id?.[0] },
              returnItem
            )
              .then((result2) => res.status(result2.code).send(result2.message))
              .catch((error2) => res.status(error2.code).send(error2.message));
          } else res.status(result.code).send(result.message);
        })
        .catch((err) => res.status(err.status).send(err.message));
    } catch (e) {
      assertion(e, res);
    }
  }

  /**
   * This function allows login operation
   * @param req request object
   * @param res response object
   * @return Returns the user data if username and password, returns error type & message in case of error
   */
  loginUser(req, res) {
    try {
      assert(req.body.username, "Username is required");
      assert(req.body.password, "Password is required");

      const password = req.body.password;

      const conditionStatement = {
        mobile: req.body.username,
      };

      const columns = ["id", "password", "organization_id"];

      this.executeSelectQuery(this.table, columns, conditionStatement)
        .then((result) => {
          const resultData = result.message?.data;
          if (resultData?.length > 0) {
            if (compareSync(password, resultData[0].password)) {
              this.createAuthSession(resultData[0], res);
            }
          } else {
            res.status(422).send({
              status: "error",
              message: "Username not registered",
            });
          }
        })
        .catch((error) => res.status(error.code).send(error.message));
    } catch (e) {
      assertion(e, res);
    }
  }
  /**
   * This function allows logout operation
   * create a JWT token and expire session
   * @param {*} result
   * @param {*} res
   */
  createAuthSession(resultData, res) {
    const token = jwt.sign({ id: resultData.id }, JWT_SECRET, {
      expiresIn: 86400, // expires in 24 hours
    });

    const updateDataItem = {
      auth_token: token,
      expiry_time: `(SELECT DATE_ADD(NOW(), INTERVAL 24 HOUR))`,
    };

    const conditionStatement = {
      id: resultData.id,
    };
    this.executeUpdateQuery(this.table, updateDataItem, conditionStatement)
      .then((result) => {
        if (result.code === 200) {
          res.header("authorization", token);
          res.status(200).send({
            status: "success",
            organization: resultData.organization_id,
            message: "Login successful",
          });
        } else {
          if (typeof result.code === "number") {
            res.status(result.code).send(result.message);
          } else {
            res.status(500).send(result.message);
          }
        }
      })
      .catch((error) => {
        if (typeof error.code === "number") {
          res.status(error.code).send(error.message);
        } else {
          res.status(500).send(error.message);
        }
      });
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   */
  logoutUser(req, res) {
    const updateData = {
      auth_token: "",
    };
    const conditionStatement = {
      organization_id: req.organization_id,
    };

    this.executeUpdateQuery(this.table, updateData, conditionStatement)
      .then((result) => {
        if (result.code === 200) {
          res.status(200).send({
            status: "success",
            message: "Logged out successfully",
          });
        } else res.status(result.code).send(result.message);
      })
      .catch((error) => res.status(error.code).send(error.message));
  }

  /**
   * This function check if the auth_token is valid or not
   * @param req request object
   * @param res response object
   * @return Returns error if auth token invalid else lets the flow control to execute
   */
  authenticateToken(req, res, next) {
    const columns = ["expiry_time", "organization_id"];
    req.organization_id = req.headers["organization_id"];
    next();
    // const conditionStatement = {
    //   auth_token: req.headers["authorization"],
    // };
    // next();
    // this.executeSelectQuery(this.table, columns, conditionStatement)
    //   .then((result) => {
    //     const resultData = result.message.data;
    //     if (resultData?.length > 0) {
    //       req.organization_id = resultData[0].organization_id;
    //       next();
    //     } else {
    //       res
    //         .status(result.code)
    //         .send({ status: "Failed", message: "Login Required" });
    //     }
    //   })
    //   .catch((error) => res.status(error.code).send(error.message));
  }
}

export default User;
