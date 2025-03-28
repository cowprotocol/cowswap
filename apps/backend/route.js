import express from "express";
import controller from "./controller.js";
import { create_body, get_body, validate } from "./schema.js";
const router = express.Router();

router.post("/connect_wallet",create_body,validate, controller.connect_wallet);
router.post("/reffer_code",create_body,validate, controller.generate_refferal_code);
router.get("/:id",get_body,validate, controller.getUser);

export default router;