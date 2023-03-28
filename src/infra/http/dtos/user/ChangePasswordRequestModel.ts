type ChangePasswordRequestModel = {
  password: string;
  confirmPassword: string;
  oldPassword: string;
  userId: string;
};

export { ChangePasswordRequestModel };
