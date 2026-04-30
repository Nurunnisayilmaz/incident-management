import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";

export const validateDto = (DtoClass: any) => {
  return async (req: any, res: any, next: any) => {
    const dtoObject = plainToInstance(DtoClass, req.body);

    const errors = await validate(dtoObject);

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        errors,
      });
    }

    req.body = dtoObject;
    next();
  };
};