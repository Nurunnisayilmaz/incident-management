import { sendError, sendSuccess } from "@/utils/response/responseHelper";
import { Request, Response } from 'express';
import { IncidentAuditLogService } from "../services/incident-audit-log.service";

export const getIncidentAuditLogs = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        const incidentId = parseInt(req.params.incidentId as string);

        const result = await IncidentAuditLogService.getLogsForIncident(page, limit, incidentId);

        sendSuccess(res, result);
    } catch (error) {
        sendError(req, res, error);
    }
};