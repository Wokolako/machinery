import { Router } from "express";
import * as shiftController from "../controllers/shift.controller.js";
import { validate } from "../middleware/validate.js";
import { demoShiftQuerySchema } from "../validators/common.validator.js";

export const shiftRoutes = Router();

shiftRoutes.get("/demo-shift", validate({ query: demoShiftQuerySchema }), shiftController.getDemoShift);
shiftRoutes.get("/ledger-example", shiftController.getLedgerExample);
