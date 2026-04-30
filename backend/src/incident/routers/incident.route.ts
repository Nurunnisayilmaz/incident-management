import { authenticate } from "@/auth/middlewares/authenticate";
import { Router } from "express";
import { create, getDetail, getList, softDelete, update} from "../controllers/incident.controller";
import { validateDto } from "../middleware/validator.middleware";
import { IncidentInputDto } from "../dto/incident.input.dto";

const router = Router();

/**
   * @openapi
   * '/api/incidents':
   *  post:
   *     tags:
   *     - Incidents
   *     summary: Create a new incident
   *     requestBody:
   *      required: true
   *      content:
   *        application/json:
   *           schema:
   *              $ref: '#/components/schemas/IncidentInput'
   *     responses:
   *      201:
   *        description: Incident created successfully
   *        content:
   *          application/json:
   *            schema:
   *              $ref: '#/components/schemas/IncidentOutput'
   *      401:
   *        description: Unauthorized
   *      400:
   *        description: Bad Request
   *      500:
   *        description: Internal Server Error
   */
router.post('/incidents', authenticate, validateDto(IncidentInputDto), create);

/**
   * @openapi
   * '/api/incidents':
   *  get:
   *     tags:
   *     - Incidents
   *     summary: Get all incidents
   *     responses:
   *      200:
   *        description: List of incidents retrieved successfully
   *        content:
   *          application/json:
   *            schema:
   *              type: array
   *              items:
   *                $ref: '#/components/schemas/IncidentOutput'
   *      401:
   *        description: Unauthorized
   *      500:
   *        description: Internal Server Error
   */
router.get('/incidents', authenticate, getList);

/**
   * @openapi
   * '/api/incidents/{id}':
   *  get:
   *     tags:
   *     - Incidents
   *     summary: Get incident by ID
   *     parameters:
   *      - name: id
   *        in: path
   *        required: true
   *        schema:
   *          type: integer
   *        description: Incident ID
   *     responses:
   *      200:
   *        description: Incident retrieved successfully
   *        content:
   *          application/json:
   *            schema:
   *              $ref: '#/components/schemas/IncidentOutput'
   *      401:
   *        description: Unauthorized
   *      404:
   *        description: Incident not found
   *      500:
   *        description: Internal Server Error
   */
router.get('/incidents/:id', authenticate, getDetail);

/**
   * @openapi
   * '/api/incidents/{id}':
   *  patch:
   *     tags:
   *     - Incidents
   *     summary: Update incident
   *     parameters:
   *      - name: id
   *        in: path
   *        required: true
   *        schema:
   *          type: integer
   *        description: Incident ID
   *     requestBody:
   *      required: true
   *      content:
   *        application/json:
   *           schema:
   *              $ref: '#/components/schemas/IncidentInput'
   *     responses:
   *      200:
   *        description: Incident updated successfully
   *        content:
   *          application/json:
   *            schema:
   *              $ref: '#/components/schemas/IncidentOutput'
   *      401:
   *        description: Unauthorized
   *      400:
   *        description: Bad Request
   *      404:
   *        description: Incident not found
   *      500:
   *        description: Internal Server Error
   */
router.patch("/incidents/:id", authenticate, update);

/**
   * @openapi
   * '/api/incidents/{id}':
   *  delete:
   *     tags:
   *     - Incidents
   *     summary: Soft delete incident
   *     parameters:
   *      - name: id
   *        in: path
   *        required: true
   *        schema:
   *          type: integer
   *        description: Incident ID
   *     responses:
   *      200:
   *        description: Incident deleted successfully
   *      401:
   *        description: Unauthorized
   *      404:
   *        description: Incident not found
   *      500:
   *        description: Internal Server Error
   */
router.delete("/incidents/:id", authenticate, softDelete);

export default router;