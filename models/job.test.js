"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js");
const Company = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */
describe("create", function () {
  const newJob = {
    title: "new",
    salary: 500000,
    equity: 0.0025,
    companyHandle: "c1",
  };

  test("works", async function () {
    let job = await Job.create(newJob);
    expect(job).toEqual(newJob);

    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle
           FROM jobs
           WHERE title = 'new'`
    );
    expect(result.rows).toEqual([
      {
        id: expect.any(Number),
        title: "new",
        salary: 500000,
        equity: 0.0025,
        companyHandle: "c1",
      },
    ]);
  });
});

/************************************** findAll */

describe("findAll", function () {
  test("works: no filter", async function () {
    let companies = await Company.findAll({});
    expect(companies).toEqual([
      {
        id: expect.any(Number),
        title: "j1",
        salary: 100000,
        equity: 0.01,
        companyHandle: "c1",
      },
      {
        id: expect.any(Number),
        title: "j2",
        salary: 200000,
        equity: 0.02,
        companyHandle: "c2",
      },
      {
        id: expect.any(Number),
        title: "j3",
        salary: 300000,
        equity: 0.03,
        companyHandle: "c3",
      },
      {
        id: expect.any(Number),
        title: "j4",
        salary: 400000,
        equity: null,
        companyHandle: "c4",
      },
    ]);
  });

  test("works: with title filter", async function () {
    let jobs = await Job.findAll({ title: "j1" });
    expect(jobs).toEqual([
      {
        id: expect.any(Number),
        title: "j1",
        salary: 100000,
        equity: 0.01,
        companyHandle: "c1",
      },
    ]);
  });

  test("works: with minSalary filter", async function () {
    let jobs = await Job.findAll({ minSalary: "299999" });

    expect(jobs).toEqual([
      {
        id: expect.any(Number),
        title: "j3",
        salary: 300000,
        equity: 0.03,
        companyHandle: "c3",
      },
      {
        id: expect.any(Number),
        title: "j4",
        salary: 400000,
        equity: null,
        companyHandle: "c4",
      },
    ]);
  });
  test("works: with hasEquity filter", async function () {
    let jobs1 = await Company.findAll({ hasEquity: "true" });
    let jobs2 = await Company.findAll({ hasEquity: "false" });

    expect(jobs1).toEqual([
      {
        id: expect.any(Number),
        title: "j1",
        salary: 100000,
        equity: 0.01,
        companyHandle: "c1",
      },
      {
        id: expect.any(Number),
        title: "j2",
        salary: 200000,
        equity: 0.02,
        companyHandle: "c2",
      },
      {
        id: expect.any(Number),
        title: "j3",
        salary: 300000,
        equity: 0.03,
        companyHandle: "c3",
      },
    ]);
    expect(jobs2).toEqual([
      {
        id: expect.any(Number),
        title: "j1",
        salary: 100000,
        equity: 0.01,
        companyHandle: "c1",
      },
      {
        id: expect.any(Number),
        title: "j2",
        salary: 200000,
        equity: 0.02,
        companyHandle: "c2",
      },
      {
        id: expect.any(Number),
        title: "j3",
        salary: 300000,
        equity: 0.03,
        companyHandle: "c3",
      },
      {
        id: expect.any(Number),
        title: "j4",
        salary: 400000,
        equity: null,
        companyHandle: "c4",
      },
    ]);
  });
  test("works: with all possible filters", async function () {
    let jobs = await Job.findAll({
      title: "j",
      minSalary: "299999",
      hasEquity: "true",
    });
    expect(jobs).toEqual([
      {
        id: expect.any(Number),
        title: "j3",
        salary: 300000,
        equity: 0.03,
        companyHandle: "c3",
      },
    ]);
  });
});

/************************************** get */

describe("get", function () {
  test("works", async function () {
    let job = await Company.get("c1");
    expect(company).toEqual({
      handle: "c1",
      name: "C1",
      description: "Desc1",
      numEmployees: 1,
      logoUrl: "http://c1.img",
    });
  });

  test("not found if no such company", async function () {
    try {
      await Company.get("nope");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

describe("update", function () {
  const updateData = {
    name: "New",
    description: "New Description",
    numEmployees: 10,
    logoUrl: "http://new.img",
  };

  test("works", async function () {
    let company = await Company.update("c1", updateData);
    expect(company).toEqual({
      handle: "c1",
      ...updateData,
    });

    const result = await db.query(
      `SELECT handle, name, description, num_employees, logo_url
           FROM jobs
           WHERE handle = 'c1'`
    );
    expect(result.rows).toEqual([
      {
        handle: "c1",
        name: "New",
        description: "New Description",
        num_employees: 10,
        logo_url: "http://new.img",
      },
    ]);
  });

  test("works: null fields", async function () {
    const updateDataSetNulls = {
      name: "New",
      description: "New Description",
      numEmployees: null,
      logoUrl: null,
    };

    let company = await Company.update("c1", updateDataSetNulls);
    expect(company).toEqual({
      handle: "c1",
      ...updateDataSetNulls,
    });

    const result = await Company.get("c1");
    expect(result).toEqual({
      handle: "c1",
      name: "New",
      description: "New Description",
      numEmployees: null,
      logoUrl: null,
    });
  });

  test("not found if no such company", async function () {
    try {
      await Company.update("nope", updateData);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    try {
      await Company.update("c1", {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** remove */

describe("remove", function () {
  test("works", async function () {
    await Company.remove("c1");
    const res = await db.query(
      "SELECT handle FROM companies WHERE handle='c1'"
    );
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such company", async function () {
    try {
      await Company.remove("nope");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** findAll */
