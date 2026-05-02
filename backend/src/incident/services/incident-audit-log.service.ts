import { getLogger } from "@/utils/logger";
import { AppDataSource } from "@/utils/database";
import { IncidentAuditLog } from "../models/incident-audit-log.entity";
import { cacheKeys } from "@/utils/cache/keys";
import cache from "@/utils/cache";
import { paginate } from "@/utils/pagination/pagination";

const logger = getLogger('Incident Audit Log Service');

export class IncidentAuditLogService {

    private static repo = AppDataSource.getRepository(IncidentAuditLog);

    static async logChanges(
        incidentId: number,
        oldData: Record<string, any>,
        newData: Record<string, any>,
        changedByUserId?: string
    ) {
        const logs = [];

        for (const key of Object.keys(newData)) {
            const oldValue = oldData[key];
            const newValue = newData[key];

            if (oldValue === newValue || key === 'updatedAt' || key === 'createdAt') continue;


            const log = this.repo.create({
                incidentId,
                field: key,
                oldValue: oldValue?.toString() ?? null,
                newValue: newValue?.toString() ?? null,
                changedByUserId,
            })

            logs.push(log);
        }

        if (logs.length > 0) {
            await this.repo.save(logs);
        }
    }

    static async getLogsForIncident(page: number, limit: number, incidentId: number) {

        if(!incidentId) {
            throw new Error('incidentId is required');
        }

        const result = await paginate(
            this.repo,
            page,
            limit,
            { incidentId },
            {
                order: {
                    createdAt: "DESC",
                },
            }
        );
        
        return result;
    }


}