import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  createPilotRequestSchema,
  listPilotRequestsSchema,
} from "../src/validators/pilotRequest.validator.js";

const valid = {
  name: "  Ada Banda ",
  company: "Lindiwe Gem Processing",
  requesterKind: "company",
  sites: "3",
  machines: "Two jaw crushers on sapphire concentrate",
  notes: "",
};

const fieldErrors = (result) =>
  Object.fromEntries(result.error.issues.map((i) => [i.path.join("."), i.message]));

describe("createPilotRequestSchema", () => {
  it("accepts a complete request and normalises it", () => {
    const result = createPilotRequestSchema.safeParse(valid);
    assert.ok(result.success);
    assert.equal(result.data.name, "Ada Banda");
    assert.equal(result.data.sites, 3);
    assert.equal(result.data.notes, null);
  });

  it("treats a blank sites field as not given", () => {
    const result = createPilotRequestSchema.safeParse({ ...valid, sites: "" });
    assert.ok(result.success);
    assert.equal(result.data.sites, null);
  });

  it("reports each missing required field with a plain message", () => {
    const result = createPilotRequestSchema.safeParse({ requesterKind: "partner" });
    assert.ok(!result.success);
    const errors = fieldErrors(result);
    assert.equal(errors.name, "Enter your name.");
    assert.equal(errors.company, "Enter your company's name.");
    assert.equal(errors.machines, "List at least one machine type and material.");
  });

  it("rejects whitespace-only names", () => {
    const result = createPilotRequestSchema.safeParse({ ...valid, name: "   " });
    assert.ok(!result.success);
    assert.equal(fieldErrors(result).name, "Enter your name.");
  });

  it("rejects an unknown requester kind", () => {
    const result = createPilotRequestSchema.safeParse({ ...valid, requesterKind: "admin" });
    assert.ok(!result.success);
    assert.match(fieldErrors(result).requesterKind, /supply machines or run them/);
  });

  it("rejects fractional and out-of-range site counts", () => {
    for (const sites of ["2.5", "0", "-1", "abc", "10001"]) {
      const result = createPilotRequestSchema.safeParse({ ...valid, sites });
      assert.ok(!result.success, `expected "${sites}" to fail`);
    }
  });

  it("caps text lengths", () => {
    const result = createPilotRequestSchema.safeParse({ ...valid, name: "x".repeat(201) });
    assert.ok(!result.success);
  });
});

describe("listPilotRequestsSchema", () => {
  it("defaults and coerces paging", () => {
    assert.deepEqual(listPilotRequestsSchema.parse({}), { limit: 25, offset: 0 });
    assert.deepEqual(listPilotRequestsSchema.parse({ limit: "5", offset: "10" }), {
      limit: 5,
      offset: 10,
    });
  });

  it("refuses page sizes above 100", () => {
    assert.ok(!listPilotRequestsSchema.safeParse({ limit: "500" }).success);
  });
});
