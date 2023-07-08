import DatabaseConnector from "../DatabaseService/Connector.js";
const dbConnector = new DatabaseConnector();

import cron from "node-cron";

export const scheduleCronJob = (frequency, repeat, start, end, invoice_id) => {
  try {
    const startDate = start ? new Date(start) : "";
    const endDate = end ? new Date(end) : "";

    let cronExpression = `* * * * *`;

    const frequency_transform = frequency.toLowerCase();
    if (
      frequency_transform === "week" ||
      frequency_transform === "weekly" ||
      frequency_transform === "weeks"
    ) {
      cronExpression = `0 0 * * ${repeat}`;
    } else if (
      frequency_transform === "month" ||
      frequency_transform === "monthly" ||
      frequency_transform === "months"
    ) {
      cronExpression = `0 0 ${repeat} * *`;
    } else if (
      frequency_transform === "year" ||
      frequency_transform === "yearly" ||
      frequency_transform === "years"
    ) {
      cronExpression = `0 0 0 1 ${repeat} *`;
    }

    cron.schedule(cronExpression, async () => {
      const currentDate = new Date();

      const checkStartDate = startDate ? currentDate >= startDate : true;
      const checkEndDate = endDate ? currentDate <= endDate : true;

      if (checkStartDate && checkEndDate && currentDate.getDay() === 1) {
        console.log("Cron Started");
        /**
         * take recurrance amount
         * Add recurrance amount with existing invoice amount
         * make payment status UNPAID
         * increase recurrance count
         */
        const invoiceResult = await dbConnector.executeSelectQuery(
          "invoice",
          ["total"],
          {
            project_id: invoice_id,
          }
        );

        let existingTotal = 0;
        if (invoiceResult.code === 200)
          existingTotal = invoiceResult.message.data?.[0]?.total || 0;

        dbConnector
          .executeSelectQuery(
            "recurring_invoice",
            ["total", "recurrance_count"],
            {
              invoice_id,
            }
          )
          .then(async (result) => {
            if (result.code === 200) {
              const recurranceTotal = result.message.data?.[0]?.total || 0;
              const recurrance_count =
                result.message?.data?.[0]?.recurrance_count || 0;

              await dbConnector.executeUpdateQuery("invoice", {
                total: parseFloat(existingTotal) + parseFloat(recurranceTotal),
                payment_status: "UNPAID",
              });

              await dbConnector.executeUpdateQuery("recurring_invoice", {
                recurrance_count: parseInt(recurrance_count) + 1,
              });
            }
          });
      }
    });
  } catch (e) {}
};
