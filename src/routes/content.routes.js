import { Router } from "express";
import * as contentController from "../controllers/content.controller.js";

export const contentRoutes = Router();

contentRoutes.get("/", contentController.listCollections);
contentRoutes.get("/:collection", contentController.getCollection);
