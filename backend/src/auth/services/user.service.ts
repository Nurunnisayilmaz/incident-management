import { getLogger } from "@/utils/logger";
import { AppDataSource } from "@/utils/database";
import { User } from "../models/user.entity";

const logger = getLogger('User Service');

export class UserService {

  private static repo = AppDataSource.getRepository(User);

  
  static async getUserById(id: string) {
    return this.repo.findOne({
      where: { id },
    });
  }
}