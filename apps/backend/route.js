import express from "express";
import controller from "./controller.js";
import { create_body, get_body, validate } from "./schema.js";
const router = express.Router();

router.post("/create",create_body,validate, controller.create);
router.get("/:id",get_body,validate, controller.getUser);

export default router;