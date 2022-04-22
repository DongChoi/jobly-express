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
    equity: null,
    companyHandle: "c1",
  };

  test("ok for admin", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send(newJob)
      .set("authorization", `Bearer ${admin1Token}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      job: newJob,
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
    //test the body as well on 62 too
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
  //tip: best to have rigorous tests for models than routes
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
    const resp = await request(app).get(`/jobs/c1`);
    expect(resp.body).toEqual({
      Job: {
        id: "c1",
        name: "C1",
        description: "Desc1",
        numEmployees: 1,
        logoUrl: "http://c1.img",
      },
    });
  });

  test("works for anon: Job w/o jobs", async function () {
    const resp = await request(app).get(`/jobs/c2`);
    expect(resp.body).toEqual({
      Job: {
        id: "c2",
        name: "C2",
        description: "Desc2",
        numEmployees: 2,
        logoUrl: "http://c2.img",
      },
    });
  });

  test("not found for no such Job", async function () {
    const resp = await request(app).get(`/jobs/nope`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** PATCH /jobs/:id */

describe("PATCH /jobs/:id", function () {
  /**UPDATING TESTS *****************************************/
  test("does not work for user", async function () {
    const resp = await request(app)
      .patch(`/jobs/c1`)
      .send({
        name: "C1-new",
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body.error.message).toEqual("Unauthorized");
    expect(resp.statusCode).toEqual(401);
  });

  test("works for admin", async function () {
    const resp = await request(app)
      .patch(`/jobs/c1`)
      .send({
        name: "C1-new",
      })
      .set("authorization", `Bearer ${admin1Token}`);
    expect(resp.body).toEqual({
      Job: {
        id: "c1",
        name: "C1-new",
        description: "Desc1",
        numEmployees: 1,
        logoUrl: "http://c1.img",
      },
    });
    expect(resp.statusCode).toEqual(200);
  });

  test("unauth for anon", async function () {
    const resp = await request(app).patch(`/jobs/c1`).send({
      name: "C1-new",
    });
    expect(resp.statusCode).toEqual(401);
    //test body
  });

  test("not found on no such Job", async function () {
    const resp = await request(app)
      .patch(`/jobs/nope`)
      .send({
        name: "new nope",
      })
      .set("authorization", `Bearer ${admin1Token}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request on id change attempt", async function () {
    const resp = await request(app)
      .patch(`/jobs/c1`)
      .send({
        id: "c1-new",
      })
      .set("authorization", `Bearer ${admin1Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request on invalid data", async function () {
    const resp = await request(app)
      .patch(`/jobs/c1`)
      .send({
        logoUrl: "not-a-url",
      })
      .set("authorization", `Bearer ${admin1Token}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** DELETE /jobs/:id */

describe("DELETE /jobs/:handle", function () {
  // test("works for users", async function () {
  //   const resp = await request(app)
  //     .delete(`/jobs/c1`)
  //     .set("authorization", `Bearer ${u1Token}`);
  //   expect(resp.body).toEqual({ deleted: "c1" });
  // });
  test("does not work for user", async function () {
    const resp = await request(app)
      .delete(`/jobs/c1`)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body.error.message).toEqual("Unauthorized");
    expect(resp.statusCode).toEqual(401);
  });

  test("works for admin", async function () {
    const resp = await request(app)
      .delete(`/jobs/c1`)
      .set("authorization", `Bearer ${admin1Token}`);
    expect(resp.body).toEqual({ deleted: "c1" });
    expect(resp.statusCode).toEqual(200);
  });

  test("unauth for anon", async function () {
    const resp = await request(app).delete(`/jobs/c1`);
    expect(resp.statusCode).toEqual(401);
    expect(resp.body.error.message).toEqual("Unauthorized");
  });

  test("not found for no such Job", async function () {
    const resp = await request(app)
      .delete(`/jobs/nope`)
      .set("authorization", `Bearer ${admin1Token}`);
    expect(resp.statusCode).toEqual(404);
  });
});
