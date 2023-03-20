type UserModel = {
  id: string;
  name: string;
  email: string;
  loginAttempts: number;
  lastFailedLoginDate?: Date;
  password: string;
  blocked: boolean;
};

export { UserModel };
