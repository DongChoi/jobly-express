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
    expect(job).toEqual({
      id: expect.any(Number),
      title: "new",
      salary: 500000,
      equity: "0.0025",
      companyHandle: "c1",
    });

    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle AS "companyHandle"
           FROM jobs
           WHERE title = 'new'`
    );
    expect(result.rows).toEqual([
      {
        id: expect.any(Number),
        title: "new",
        salary: 500000,
        equity: "0.0025",
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
        equity: "0.01",
        companyHandle: "c1",
      },
      {
        id: expect.any(Number),
        title: "j2",
        salary: 200000,
        equity: "0.02",
        companyHandle: "c2",
      },
      {
        id: expect.any(Number),
        title: "j3",
        salary: 300000,
        equity: "0.03",
        companyHandle: "c3",
      },
      {
        id: expect.any(Number),
        title: "j4",
        salary: 400000,
        equity: null,
        companyHandle: "c1",
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
        equity: "0.01",
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
        equity: "0.03",
        companyHandle: "c3",
      },
      {
        id: expect.any(Number),
        title: "j4",
        salary: 400000,
        equity: null,
        companyHandle: "c1",
      },
    ]);
  });
  test("works: with hasEquity filter", async function () {
    let jobs1 = await Job.findAll({ hasEquity: true });
    let jobs2 = await Job.findAll({ hasEquity: false });

    expect(jobs1).toEqual([
      {
        id: expect.any(Number),
        title: "j1",
        salary: 100000,
        equity: "0.01",
        companyHandle: "c1",
      },
      {
        id: expect.any(Number),
        title: "j2",
        salary: 200000,
        equity: "0.02",
        companyHandle: "c2",
      },
      {
        id: expect.any(Number),
        title: "j3",
        salary: 300000,
        equity: "0.03",
        companyHandle: "c3",
      },
    ]);

    expect(jobs2).toEqual([
      {
        id: expect.any(Number),
        title: "j1",
        salary: 100000,
        equity: "0.01",
        companyHandle: "c1",
      },
      {
        id: expect.any(Number),
        title: "j2",
        salary: 200000,
        equity: "0.02",
        companyHandle: "c2",
      },
      {
        id: expect.any(Number),
        title: "j3",
        salary: 300000,
        equity: "0.03",
        companyHandle: "c3",
      },
      {
        id: expect.any(Number),
        title: "j4",
        salary: 400000,
        equity: null,
        companyHandle: "c1",
      },
    ]);
  });
  test("works: with all possible filters", async function () {
    let jobs = await Job.findAll({
      title: "j",
      minSalary: "299999",
      hasEquity: true,
    });

    expect(jobs).toEqual([
      {
        id: expect.any(Number),
        title: "j3",
        salary: 300000,
        equity: "0.03",
        companyHandle: "c3",
      },
    ]);
  });
});

/************************************** get */

describe("get", function () {
  test("works", async function () {
    let job = await Job.get(1);
    expect(job).toEqual({
      id: expect.any(Number),
      title: "j1",
      salary: 100000,
      equity: "0.01",
      companyHandle: "c1",
    });
  });

  test("not found if no such job", async function () {
    try {
      await Job.get(100);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
      expect(err.message).toEqual("No job by id: 100");
    }
  });
});

/************************************** update */

describe("update", function () {
  const updateData = {
    title: "RithmSchool",
    salary: 250000,
    equity: "0.003",
  };

  test("works", async function () {
    let job = await Job.update("3", updateData);
    expect(job).toEqual({
      id: 3,
      ...updateData,
      companyHandle: "c3",
    });

    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle
           FROM jobs
           WHERE id = 3`
    );
    expect(result.rows).toEqual([
      {
        id: 3,
        title: "RithmSchool",
        salary: 250000,
        equity: "0.003",
        company_handle: "c3",
      },
    ]);
  });

  test("works: null fields", async function () {
    const updateDataSetNulls = {
      title: "RithmSchool",
      salary: null,
      equity: null,
    };

    let job = await Job.update(1, updateDataSetNulls);
    expect(job).toEqual({
      id: 1,
      ...updateDataSetNulls,
      companyHandle: "c1",
    });

    const result = await Job.get(1);
    expect(result).toEqual({
      id: 1,
      title: "RithmSchool",
      salary: null,
      equity: null,
      companyHandle: "c1",
    });
  });

  test("not found if no such job", async function () {
    try {
      await Job.update(1000, updateData);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
      expect(err.message).toEqual("No job by id: 1000");
    }
  });

  test("bad request with no data", async function () {
    try {
      await Job.update(1, {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** remove */

describe("remove", function () {
  test("works", async function () {
    await Job.remove(1);
    const res = await db.query("SELECT id FROM jobs WHERE id=1");
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such job", async function () {
    try {
      await Job.remove(1000);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
      expect(err.message).toEqual("No job by id: 1000");
    }
  });
});

// /************************************** findAll */
