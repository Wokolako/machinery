import { Router } from "express";
import { contentRoutes } from "./content.routes.js";
import { healthRoutes } from "./health.routes.js";
import { machineRoutes } from "./machine.routes.js";
import { pilotRequestRoutes } from "./pilotRequest.routes.js";
import { shiftRoutes } from "./shift.routes.js";
import { siteRoutes } from "./site.routes.js";

// Everything below is mounted under /api.
//
//   GET  /health                         API and database status
//   GET  /site                           settings and page list
//   GET  /pages/:slug                    one page's intro and sections
//   GET  /content                        names of the content collections
//   GET  /content/:collection            one collection (steps, tiers, flags, …)
//   GET  /machines                       machines with their company
//   GET  /machines/:assetCode            one machine
//   GET  /machines/:assetCode/shifts     recent shift closes with metrics and flags
//   GET  /machines/:assetCode/scopes     every scope version
//   GET  /demo-shift?machine=CR-04       data for the website's live shift record
//   GET  /ledger-example                 the latest correction and what it replaced
//   POST /pilot-requests                 save a pilot request (rate limited)
//   GET  /pilot-requests                 list requests        (X-API-Key)
//   GET  /pilot-requests/:id             one request          (X-API-Key)
export const apiRoutes = Router();

apiRoutes.use("/health", healthRoutes);
apiRoutes.use("/", siteRoutes);
apiRoutes.use("/content", contentRoutes);
apiRoutes.use("/machines", machineRoutes);
apiRoutes.use("/", shiftRoutes);
apiRoutes.use("/pilot-requests", pilotRequestRoutes);
