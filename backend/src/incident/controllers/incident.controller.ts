import { sendError, sendSuccess } from "@/utils/response/responseHelper";
import { Request, Response } from 'express';
import { cache } from "@/utils/cache";
import { cacheKeys } from "@/utils/cache/keys";
import { IncidentService } from "../services/incident.service";
import { IncidentStatusEnum } from "../models/enums/incident-status.enum";
import { IncidentSeverityEnum } from "../models/enums/incident-severity.enum";
import { IncidentServiceEnum } from "../models/enums/incident-service.enum";
import { AppError } from "@/utils/response/appError";

export const create = async (req: Request, res: Response) => {
    try {
        const incident = await IncidentService.create(req.body);
        sendSuccess(res, incident);
    } catch (error) {
        sendError(req, res, error);
    }
};

export const getList = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        const search = req.query.search as string | undefined;
        const status = req.query.status as IncidentStatusEnum | undefined;
        const severity = req.query.severity as IncidentSeverityEnum | undefined;
        const service = req.query.service as IncidentServiceEnum | undefined;

        const result = await IncidentService.getList(page, limit, search, status, severity, service);

        sendSuccess(res, result);
    } catch (error) {
        sendError(req, res, error);
    }
};

export const getDetail = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const incident = await IncidentService.getIncident(id);
        sendSuccess(res, incident);
    }
    catch (error) {
        sendError(req, res, error);
    }
};

export const update = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id)) {
            throw new AppError(400, "Invalid id");
        }

        const dto = req.body;

        const result = await IncidentService.update(id, dto);

        sendSuccess(res, result);
    } catch (error) {
        sendError(req, res, error);
    }
};

export const softDelete = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id)) {
            throw new AppError(400, "Invalid id");
        }
        const result = await IncidentService.softDelete(id);
        sendSuccess(res, result);
    } catch (error) {
        sendError(req, res, error);
    }
};