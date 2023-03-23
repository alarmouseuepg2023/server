type ResetPasswordRequestModel = {
  password: string;
  confirmPassword: string;
  oldPassword: string;
  userId: string;
};

export { ResetPasswordRequestModel };
