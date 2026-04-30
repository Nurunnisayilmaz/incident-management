import { DataSource } from 'typeorm';
import { getLogger } from '@/utils/logger';
import envvars from '@/config/envvars';
import { Incident } from '@/incident/models/incident.entity';
import { AuthSession } from '@/auth/models/auth.session.entity';
import { User } from '@/auth/models/user.entity';

const logger = getLogger('Database');

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: envvars.db.host,
  port: envvars.db.port,
  username: envvars.db.username,
  password: envvars.db.password,
  database: envvars.db.database,
  synchronize: envvars.db.synchronize,

  entities: [User, AuthSession, Incident],
});

export const connectDatabase = async () => {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      logger.info('Database connected successfully');
    }

    return AppDataSource;
  } catch (error) {
    logger.error('Database connection error', error);
    throw error;
  }
};

export const runTransaction = async <T>(handler: (manager: any) => Promise<T>) => {
  const queryRunner = AppDataSource.createQueryRunner();

  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const result = await handler(queryRunner.manager);
    await queryRunner.commitTransaction();
    return result;
  } catch (e) {
    await queryRunner.rollbackTransaction();
    throw e;
  } finally {
    await queryRunner.release();
  }
};