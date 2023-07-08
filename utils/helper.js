import assert, { AssertionError } from "assert";
export const assertion = (e, res) => {
  if (e instanceof AssertionError) {
    res.status(500).send({
      status: "AssertionError",
      message: e.message,
    });
  } else {
    res.status(500).send({
      status: "error",
      message: e.message,
    });
  }
};

export const isObjectEmpty = (obj) => {
  return Object.keys(obj).length === 0;
};
