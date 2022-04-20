const { sqlForPartialUpdate } = require("./sql");

/**TODO: make better names */
describe("successfully returns partial info", function () {
  test("take data and returns correct query and values", function () {
    const data = { firstName: "Aliya", age: 32 };
    const jsToSql = {
      firstName: "first_name",
      lastName: "last_name",
      isAdmin: "is_admin",
    };
    const results = sqlForPartialUpdate(data, jsToSql);
    expect(results).toEqual({
      setCols: '"first_name"=$1, "age"=$2',
      values: ["Aliya", 32],
    });
  });
});
