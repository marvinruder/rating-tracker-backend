import { jest } from "@jest/globals";

jest.unstable_mockModule(
  "./redis/repositories/stockRepositoryBase",
  async () => await import("./redis/repositories/__mocks__/stockRepositoryBase")
);

const { listener, server } = await import("./server");
import supertest from "supertest";
import { Stock } from "./models/stock.js";
import { initMockRepository } from "./redis/repositories/__mocks__/stockRepositoryBase";

const requestWithSupertest = supertest(server.app);

beforeAll((done) => {
  done();
});

beforeEach((done) => {
  initMockRepository();
  done();
});

afterAll((done) => {
  listener.close();
  done();
});

const expectStockListLength = async (length: number) => {
  const res = await requestWithSupertest.get("/api/stock/list");
  expect(res.status).toBe(200);
  expect(res.body.count).toBe(length);
  expect(res.body.stocks).toHaveLength(length);
  return res;
};

describe("Stock API", () => {
  it("returns a list of stocks", async () => {
    const res = await requestWithSupertest.get("/api/stock/list");
    expect(res.status).toBe(200);
    expect(res.body.count).toBe(11);
    expect(res.body.stocks).toHaveLength(11);
    expect(
      (res.body.stocks as Stock[]).find(
        (stock) => stock.ticker === "exampleAAPL"
      ).name
    ).toMatch("Apple");
  });

  it("creates example stocks", async () => {
    let res = await requestWithSupertest.delete("/api/stock/exampleAAPL");
    expect(res.status).toBe(204);
    await expectStockListLength(10);
    res = await requestWithSupertest.put("/api/stock/fillWithExampleData");
    expect(res.status).toBe(201);
    await expectStockListLength(11);
  });

  it("deletes a stock", async () => {
    let res = await requestWithSupertest.delete("/api/stock/exampleAAPL");
    expect(res.status).toBe(204);
    res = await expectStockListLength(10);
    expect(
      (res.body.stocks as Stock[]).find(
        (stock) => stock.ticker === "exampleAAPL"
      )
    ).toBeUndefined();

    // attempting to delete a non-existent stock returns an error
    res = await requestWithSupertest.delete("/api/stock/exampleAAPL");
    expect(res.status).toBe(404);
    expect(res.body.message).toMatch("Stock exampleAAPL not found.");
  });
});

describe("Status API", () => {
  it("returns status “operational”", async () => {
    const res = await requestWithSupertest.get("/api/status");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("operational");
  });
});

describe("Swagger API", () => {
  it("provides documentation", async () => {
    const res = await requestWithSupertest.get("/api-spec/v3");
    expect(res.status).toBe(200);
  });
});
