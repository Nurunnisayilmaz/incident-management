import envvars from '@/config/envvars';
import bcrypt from 'bcrypt';

const saltRounds = envvars.hashing.saltRounds;

export const hashPassword = async (password: string): Promise<string> => {
    return await bcrypt.hashSync(password, saltRounds);
};

export const comparePasswords = async (password: string, hash: string): Promise<boolean> => {
    return await bcrypt.compare(password, hash);
};