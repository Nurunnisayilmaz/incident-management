import { authenticate } from "@/auth/middlewares/authenticate";
import { Router } from "express";
import { create, getDetail, getList, softDelete, update} from "../controllers/incident.controller";
import { validateDto } from "../middleware/validator.middleware";
import { IncidentInputDto } from "../dto/incident.input.dto";

const router = Router();

router.post('/incidents', authenticate, validateDto(IncidentInputDto), create);
router.get('/incidents', authenticate, getList);
router.get('/incidents/:id', authenticate, getDetail);

router.patch("/incidents/:id", authenticate, update);
router.delete("/incidents/:id", authenticate, softDelete);

export default router;