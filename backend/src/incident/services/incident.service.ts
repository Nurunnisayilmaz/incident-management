import { getLogger } from "@/utils/logger";
import { cacheKeys } from "@/utils/cache/keys";
import { cache } from "@/utils/cache";
import { paginate } from "@/utils/pagination/pagination";
import { IncidentInputDto } from "../dto/incident.input.dto";
import { Incident } from "../models/incident.entity";
import { AppDataSource, runTransaction } from "@/utils/database";
import { IncidentStatusEnum } from "../models/enums/incident-status.enum";
import { IncidentSeverityEnum } from "../models/enums/incident-severity.enum";
import { ILike } from "typeorm";
import { AppError } from "@/utils/response/appError";
import { getIO } from "@/utils/socket";
import { IncidentAuditLogService } from "./incident-audit-log.service";
import { IncidentOutputDto } from "../dto/incident.output.dto";
import { PaginationMetadata } from "@/utils/pagination/types";

const logger = getLogger('Incident Service');

export class IncidentService {

    private static repo = AppDataSource.getRepository(Incident);

    static async create(dto: IncidentInputDto): Promise<IncidentOutputDto>  {

        const { title, description, service, severity } = dto;

        const saved = await runTransaction(async (manager) => {
            const repo = manager.getRepository(Incident);

            const incident = repo.create({
                title: title,
                description: description,
                service: service,
                severity: severity,
            });

            return await repo.save(incident);
        });

        logger.info('Incident created', { id: saved.id });

        await cache.deleteSmart(cacheKeys.incidents);

        getIO().emit('incident:created', saved);

        return saved;
    }

    static async getList(
        page: number,
        limit: number,
        service?: string,
        status?: IncidentStatusEnum,
        severity?: IncidentSeverityEnum,
    ) {

        const cacheKey = cacheKeys.incidents.key({ page, limit });

        const cached = await cache.get(cacheKey);
        if (cached) return cached;

        const where: any = {};

        if (service) {
            where.service = ILike(`%${service}%`);
        }

        if (status) {
            where.status = status;
        }

        if (severity) {
            where.severity = severity;
        }


        const result = await paginate(
            this.repo,
            page,
            limit,
            where,
            {
                order: {
                    createdAt: "DESC",
                },
            }
        );

        await cache.set(cacheKey, result, cacheKeys.incidents.ttl);

        return result;
    }

    static async getIncident(id: number): Promise<IncidentOutputDto | null> {
        return this.repo.findOne({
            where: { id },
        });
    }

    static async update(id: number, dto: Partial<IncidentInputDto>): Promise<IncidentOutputDto | null> {
        const updated = await runTransaction(async (manager) => {
            const repo = manager.getRepository(Incident);

            const incident = await repo.findOne({
                where: { id },
            });

            if (!incident) {
                throw new AppError(404, 'Incident not found');
            }

            const oldIncident = { ...incident };

            const merged = repo.merge(incident, dto);
            const saved = await repo.save(merged);

            await IncidentAuditLogService.logChanges(
                id,
                oldIncident,
                saved
            );

            return saved;
        });

        logger.info('Incident updated', { id: updated.id });

        await cache.deleteSmart(cacheKeys.incidents);

        getIO().emit('incident:updated', updated);

        return updated;
    }

    static async softDelete(id: number) {
        await runTransaction(async (manager) => {
            const repo = manager.getRepository(Incident);
            const incident = await repo.findOne({
                where: { id },
            });
            if (!incident) {
                throw new AppError(404, 'Incident not found');
            }
            await repo.softDelete(id);
        });
        logger.info('Incident soft deleted', { id });
        await cache.deleteSmart(cacheKeys.incidents);

        getIO().emit('incident:deleted', { id });
    }
}