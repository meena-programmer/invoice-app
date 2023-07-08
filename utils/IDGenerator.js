import DatabaseConnector from "../DatabaseService/Connector.js";
const dbConnector = new DatabaseConnector();

const generateId = async (props) => {
  const { table, columns = [], padStart = "4" } = props;
  const column = columns?.map((item) => {
    return item?.isCondition
      ? Object.entries(item.condition)
          .map(
            ([key, value]) =>
              `MAX(CASE WHEN ${key}='${value}' THEN ${item.column} END) AS ${item.column}`
          )
          .join()
      : `MAX(${item.column}) AS ${item.column}`;
  });

  // To add new id get max(id) value and increment it to create new id
  const response = await dbConnector
    .executeSelectQuery(table, column)
    .then((res) => getId(res, columns, padStart))
    .catch((err) => err);

  return response;
};

const getId = (res, column, padStart) => {
  if (res.code === 200) {
    const generatedKeys = column?.map((item) => {
      const maxId = res.message.data?.[0]?.[item.column];
      const numericPortion = maxId
        ? parseInt(maxId.substring(item.startsWith?.length || 0))
        : 0;

      const count = item?.count || 1;
      let formattedId = [];
      for (let i = 0; i < count; i++) {
        const incrementedId = numericPortion + (i + 1);
        const id = `${item.startsWith}${incrementedId
          .toString()
          .padStart(padStart, "0")}`;

        formattedId.push(id);
      }

      return item?.isCondition
        ? { max_id: formattedId }
        : { max_unique_id: formattedId };
    });

    const transformedData = {};

    generatedKeys.forEach((obj) => {
      for (const key in obj) {
        if (transformedData.hasOwnProperty(key)) {
          transformedData[key].push(...obj[key]);
        } else {
          transformedData[key] = [...obj[key]];
        }
      }
    });

    return {
      code: 200,
      data: transformedData,
    };
  } else return res;
};

export default generateId;
