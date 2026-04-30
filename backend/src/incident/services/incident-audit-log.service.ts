import { getLogger } from "@/utils/logger";
import { AppDataSource } from "@/utils/database";
import { IncidentAuditLog } from "../models/incident-audit-log.entity";

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

            if (oldValue === newValue || key === 'updatedAt') continue;


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


}