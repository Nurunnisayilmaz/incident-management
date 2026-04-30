export type AuthSessionBaseType = {
  id: string;
  sessionId: string;
  userId: string;
  refreshToken: string;
  expiredAt: Date | null;
};

