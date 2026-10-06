import { Router } from "express";
import * as machineController from "../controllers/machine.controller.js";
import { validate } from "../middleware/validate.js";
import { assetCodeParamSchema, shiftListQuerySchema } from "../validators/common.validator.js";

export const machineRoutes = Router();

const byAssetCode = validate({ params: assetCodeParamSchema });

machineRoutes.get("/", machineController.listMachines);
machineRoutes.get("/:assetCode", byAssetCode, machineController.getMachine);
machineRoutes.get(
  "/:assetCode/shifts",
  validate({ params: assetCodeParamSchema, query: shiftListQuerySchema }),
  machineController.getMachineShifts,
);
machineRoutes.get("/:assetCode/scopes", byAssetCode, machineController.getMachineScopes);
