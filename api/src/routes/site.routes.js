import { Router } from "express";
import * as siteController from "../controllers/site.controller.js";
import { validate } from "../middleware/validate.js";
import { slugParamSchema } from "../validators/common.validator.js";

export const siteRoutes = Router();

siteRoutes.get("/site", siteController.getSite);
siteRoutes.get("/pages/:slug", validate({ params: slugParamSchema }), siteController.getPage);
