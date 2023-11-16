import { afterAll, beforeAll, describe, expect, test } from "@jest/globals";
import { PrismaClient } from "@prisma/client";
import { ignoreDeletedInAggregateMiddleware } from "../../../../prisma/middleware/softDelete/ignoreDeletedInAggregateMiddleware";
import test_company_a from "../../../../prisma/seed/Companies/test_company_a";
import path from "path";
import fsPromises from "fs/promises";

const prisma = new PrismaClient();
prisma.$use(ignoreDeletedInAggregateMiddleware); //on find: adds 'where deletedAt is null' to all queries and recursively to joins

describe("ignoreDeletedInAggregateMiddleware", () => {
  test("returns active records", async () => {
    await prisma.company_DEI_Gender.create({
      data: { Gender: "Female", Company_ID: test_company_a.company.ID },
    });
    await prisma.company_DEI_Gender.create({
      data: { Gender: "Male", Company_ID: test_company_a.company.ID },
    });
    const result = await prisma.company_DEI_Gender.aggregate({
      where: {
        Company_ID: test_company_a.company.ID,
      },
      _count: true,
    });
    await prisma.company_DEI_Gender.deleteMany({
      where: {
        Company_ID: test_company_a.company.ID,
      },
    });
    expect(result._count).toBe(2);
  });
  test("does not return deleted records", async () => {
    await prisma.company_DEI_Gender.create({
      data: {
        Gender: "Female",
        Company_ID: test_company_a.company.ID,
        deletedAt: new Date(),
      },
    });
    await prisma.company_DEI_Gender.create({
      data: {
        Gender: "Male",
        Company_ID: test_company_a.company.ID,
        deletedAt: new Date(),
      },
    });
    const result = await prisma.company_DEI_Gender.aggregate({
      where: {
        Company_ID: test_company_a.company.ID,
      },
      _count: true,
    });
    await prisma.company_DEI_Gender.deleteMany({
      where: {
        Company_ID: test_company_a.company.ID,
      },
    });
    expect(result._count).toBe(0);
  });
});