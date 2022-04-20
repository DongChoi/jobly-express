const { fail } = require("assert");
const { sqlForPartialUpdate } = require("./sql");
const { BadRequestError } = require("../expressError");


/**TODO: make better names */
describe("successfully returns partial info", function () {
  test("take data and returns correct data", function () {
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

  test("bad request with no data", function () {
    try{
    const data = {};
    const jsToSql = {
      firstName: "first_name",
      lastName: "last_name",
      isAdmin: "is_admin",
      };
    const results = sqlForPartialUpdate(data, jsToSql);
    fail();
    }
    catch (err){
      expect(err instanceof BadRequestError ).toBeTruthy();
    }
    });

  });

