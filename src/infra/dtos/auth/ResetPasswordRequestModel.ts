type ResetPasswordRequestModel = {
  pin: string;
  password: string;
  confirmPassword: string;
  email: string;
};

export { ResetPasswordRequestModel };
