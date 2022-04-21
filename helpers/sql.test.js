const { fail } = require("assert");
const { sqlForPartialUpdate, sqlForFilter } = require("./sql");
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
    try {
      const data = {};
      const jsToSql = {
        firstName: "first_name",
        lastName: "last_name",
        isAdmin: "is_admin",
      };
      const results = sqlForPartialUpdate(data, jsToSql);
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

describe("Transform search values to sql query and value", function () {
  test("Returns correct name query string", function () {
    const data = { name: "and" };
    const jsToSql = {
      minEmployees: "num_employees >= ",
      maxEmployees: "num_employees <= ",
      name: "name ILIKE ",
    };
    const results = sqlForFilter(data, jsToSql);
    expect(results).toEqual({
      setWheres: "WHERE name ILIKE $1",
      values: ["%and%"],
    });
  });
  test("Returns correct minEmployees query string", function () {
    const data = { minEmployees: "1" };
    const jsToSql = {
      minEmployees: "num_employees >= ",
      maxEmployees: "num_employees <= ",
      name: "name ILIKE ",
    };
    const results = sqlForFilter(data, jsToSql);
    expect(results).toEqual({
      setWheres: "WHERE num_employees >= $1",
      values: ["1"],
    });
  });
  test("Returns correct maxEmployees query string", function () {
    const data = { maxEmployees: "1" };
    const jsToSql = {
      minEmployees: "num_employees >= ",
      maxEmployees: "num_employees <= ",
      name: "name ILIKE ",
    };
    const results = sqlForFilter(data, jsToSql);
    expect(results).toEqual({
      setWheres: "WHERE num_employees <= $1",
      values: ["1"],
    });
  });
  test("Returns no query string", function () {
    const data = {};
    const jsToSql = {
      minEmployees: "num_employees >= ",
      maxEmployees: "num_employees <= ",
      name: "name ILIKE ",
    };
    const results = sqlForFilter(data, jsToSql);
    expect(results).toEqual({
      setWheres: "",
      values: [],
    });
  });
  //DEAR INSTRUCTORS, HOW DO WE TEST FOR LINE 50 ON SQL.JS?
  test("Returns filter combination query string", function () {
    const data = {
      name: "arn",
      minEmployees: "2",
      maxEmployees: "3",
    };
    const jsToSql = {
      minEmployees: "num_employees >= ",
      maxEmployees: "num_employees <= ",
      name: "name ILIKE ",
    };
    const results = sqlForFilter(data, jsToSql);
    expect(results).toEqual({
      setWheres:
        "WHERE name ILIKE $1 AND num_employees >= $2 AND num_employees <= $3",
      values: ["%arn%", "2", "3"],
    });
  });

  // test("bad request with no data", function () {
  //   try {
  //     const data = {};
  //     const jsToSql = {
  //       firstName: "first_name",
  //       lastName: "last_name",
  //       isAdmin: "is_admin",
  //     };
  //     const results = sqlForSearch(data, jsToSql);
  //     fail();
  //   } catch (err) {
  //     expect(err instanceof BadRequestError).toBeTruthy();
  //   }
  // });
});
