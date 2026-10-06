import { Router } from "express";
import { config } from "../config/index.js";
import * as pilotController from "../controllers/pilotRequest.controller.js";
import { rateLimit } from "../middleware/rateLimit.js";
import { requireApiKey } from "../middleware/requireApiKey.js";
import { validate } from "../middleware/validate.js";
import {
  createPilotRequestSchema,
  listPilotRequestsSchema,
  pilotRequestIdSchema,
} from "../validators/pilotRequest.validator.js";

export const pilotRequestRoutes = Router();

// Public: the website's pilot form.
pilotRequestRoutes.post(
  "/",
  rateLimit({
    limit: config.PILOT_RATE_LIMIT,
    windowMs: config.PILOT_RATE_WINDOW_MINUTES * 60_000,
  }),
  validate({ body: createPilotRequestSchema }),
  pilotController.createPilotRequest,
);

// Admin: read submitted requests. Requires the X-API-Key header.
pilotRequestRoutes.get(
  "/",
  requireApiKey,
  validate({ query: listPilotRequestsSchema }),
  pilotController.listPilotRequests,
);
pilotRequestRoutes.get(
  "/:id",
  requireApiKey,
  validate({ params: pilotRequestIdSchema }),
  pilotController.getPilotRequest,
);
