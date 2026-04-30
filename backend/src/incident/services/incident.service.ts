import { getLogger } from "@/utils/logger";
import { cacheKeys } from "@/utils/cache/keys";
import { cache } from "@/utils/cache";
import { paginate } from "@/utils/pagination/pagination";
import { IncidentInputDto } from "../dto/incident.input.dto";
import { Incident } from "../models/incident.entity";
import { AppDataSource, runTransaction } from "@/utils/database";
import { IncidentStatusEnum } from "../models/enums/incident-status.enum";
import { IncidentSeverityEnum } from "../models/enums/incident-severity.enum";
import { IncidentServiceEnum } from "../models/enums/incident-service.enum";
import { ILike } from "typeorm";
import { AppError } from "@/utils/response/appError";

const logger = getLogger('Incident Service');

export class IncidentService {

    private static repo = AppDataSource.getRepository(Incident);

    static async create(dto: IncidentInputDto) {

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

        return saved;
    }

    static async getList(
        page: number,
        limit: number,
        search?: string,
        status?: IncidentStatusEnum,
        severity?: IncidentSeverityEnum,
        service?: IncidentServiceEnum
    ) {

        const cacheKey = cacheKeys.incidents.key({ page, limit });

        const cached = await cache.get(cacheKey);
        if (cached) return cached;

        const where: any = {};

        if (search) {
            where.title = ILike(`%${search}%`);
        }

        if (status) {
            console.log('Filtering by status:', status);
            where.status = status;
        }

        if (severity) {
            where.severity = severity;
        }

        if (service) {
            where.service = service;
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

    static async getIncident(id: number) {
        return this.repo.findOne({
            where: { id },
        });
    }

    static async update(id: number, dto: Partial<IncidentInputDto>) {
        const updated = await runTransaction(async (manager) => {
            const repo = manager.getRepository(Incident);

            const incident = await repo.findOne({
                where: { id },
            });

            if (!incident) {
                throw new AppError(404, 'Incident not found');
            }

            const merged = repo.merge(incident, dto);

            return await repo.save(merged);
        });

        logger.info('Incident updated', { id: updated.id });

        await cache.deleteSmart(cacheKeys.incidents);

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
    }
}