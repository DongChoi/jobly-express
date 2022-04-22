"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  admin1Token,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */

describe("POST /jobs", function () {
  const newJob = {
    title: "new job",
    salary: 1,
    companyHandle: "c1",
  };

  test("ok for admin", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send(newJob)
      .set("authorization", `Bearer ${admin1Token}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      job: {
        id: expect.any(Number),
        title: "new job",
        salary: 1,
        equity: null,
        companyHandle: "c1",
      },
    });
  });

  test("does not work for user", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send(newJob)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body.error.message).toEqual("Unauthorized");
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app).post("/jobs").send(newJob);
    expect(resp.statusCode).toEqual(401);
    expect(resp.body.error.message).toEqual("Unauthorized");
  });

  test("bad request with missing data", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send({
        companyHandle: "c1",
        hasEquity: 0.01,
      })
      .set("authorization", `Bearer ${admin1Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send({
        ...newJob,
        hasEquity: "not-a-url",
      })
      .set("authorization", `Bearer ${admin1Token}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /jobs */

describe("GET /jobs", function () {
  test("ok for anon", async function () {
    const resp = await request(app).get("/jobs");
    expect(resp.body).toEqual({
      jobs: [
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
      ],
    });
  });


  test("filters jobs", async function () {
    const respWithtitle = await request(app).get("/jobs/?title=j1");
    const respWithMin = await request(app).get("/jobs/?minSalary=300000");
    const respWithEquity = await request(app).get("/jobs/?hasEquity=true");
    const respwithTwoFilter = await request(app).get(
      "/jobs/?title=j&minSalary=300000"
    );
    expect(respWithtitle.body).toEqual({
      jobs: [
        {
          id: expect.any(Number),
          title: "j1",
          salary: 100000,
          equity: "0.01",
          companyHandle: "c1",
        },
      ],
    });

    expect(respWithMin.body).toEqual({
      jobs: [
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
      ],
    });
    expect(respWithEquity.body).toEqual({
      jobs: [
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
      ],
    });
    expect(respwithTwoFilter.body).toEqual({
      jobs: [
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
      ],
    });
  });

  test("throws correct handler", async function () {
    const resp = await request(app).get("/jobs/?minSalary=akdj");

    expect(resp.statusCode).toEqual(400);
    expect(resp.body.error.message[0]).toEqual(
      "instance.minSalary is not of a type(s) integer"
    );
  });

  test("fails: test next() handler", async function () {
    // there's no normal failure event which will cause this route to fail ---
    // thus making it hard to test that the error-handler works with it. This
    // should cause an error, all right :)
    await db.query("DROP TABLE jobs CASCADE");
    const resp = await request(app)
      .get("/jobs")
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(500);
  });
});

/************************************** GET /jobs/:handle */

describe("GET /jobs/:id", function () {
  test("works for anon", async function () {
    const resp = await request(app).get(`/jobs/1`);
    expect(resp.body).toEqual({
      job: {
        id: 1,
        title: "j1",
        salary: 100000,
        equity: "0.01",
        companyHandle: "c1",
      },
    });
  });

  test("works for anon: Job w/o jobs", async function () {
    const resp = await request(app).get(`/jobs/2`);
    expect(resp.body).toEqual({
      job: {
        id: 2,
        title: "j2",
        salary: 200000,
        equity: "0.02",
        companyHandle: "c2",
      },
    });
  });

  test("not found for no such Job", async function () {
    const resp = await request(app).get(`/jobs/999`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** PATCH /jobs/:id */

describe("PATCH /jobs/:id", function () {
  test("does not work for user", async function () {
    const resp = await request(app)
      .patch(`/jobs/1`)
      .send({
        title: "j1-new",
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body.error.message).toEqual("Unauthorized");
    expect(resp.statusCode).toEqual(401);
  });

  test("works for admin", async function () {
    const resp = await request(app)
      .patch(`/jobs/1`)
      .send({
        title: "j1-new",
      })
      .set("authorization", `Bearer ${admin1Token}`);
    expect(resp.body).toEqual({
      job: {
        id: expect.any(Number),
        title: "j1-new",
        salary: 100000,
        equity: "0.01",
        companyHandle: "c1",
      },
    }),
      expect(resp.statusCode).toEqual(200);
  });

  test("unauth for anon", async function () {
    const resp = await request(app).patch(`/jobs/1`).send({
      title: "j1-new",
    });
    expect(resp.statusCode).toEqual(401);
    expect(resp.body.error.message).toEqual("Unauthorized");
  });

  test("not found on no such Job", async function () {
    const resp = await request(app)
      .patch(`/jobs/999`)
      .send({
        title: "new nope",
      })
      .set("authorization", `Bearer ${admin1Token}`);
    expect(resp.statusCode).toEqual(404);
    expect(resp.body.error.message).toEqual("No job by id: 999");
  });

  test("bad request on id change attempt", async function () {
    const resp = await request(app)
      .patch(`/jobs/1`)
      .send({
        id: "12",
      })
      .set("authorization", `Bearer ${admin1Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request on invalid data", async function () {
    const resp = await request(app)
      .patch(`/jobs/1`)
      .send({
        equity: "not-a-url",
      })
      .set("authorization", `Bearer ${admin1Token}`);
    expect(resp.statusCode).toEqual(400);
    expect(resp.body.error.message[0]).toEqual(
      "instance.equity is not of a type(s) number"
    );
  });
});

/************************************** DELETE /jobs/:id */

describe("DELETE /jobs/:id", function () {
  test("does not work for user", async function () {
    const resp = await request(app)
      .delete(`/jobs/1`)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body.error.message).toEqual("Unauthorized");
    expect(resp.statusCode).toEqual(401);
  });

  test("works for admin", async function () {
    const resp = await request(app)
      .delete(`/jobs/1`)
      .set("authorization", `Bearer ${admin1Token}`);
    expect(resp.body).toEqual({ deleted: "1" });
    expect(resp.statusCode).toEqual(200);
  });

  test("unauth for anon", async function () {
    const resp = await request(app).delete(`/jobs/1`);
    expect(resp.statusCode).toEqual(401);
    expect(resp.body.error.message).toEqual("Unauthorized");
  });

  test("not found for no such Job", async function () {
    const resp = await request(app)
      .delete(`/jobs/9999`)
      .set("authorization", `Bearer ${admin1Token}`);
    expect(resp.statusCode).toEqual(404);
  });
});
