type updateLoginControlPropsInput = {
  userId: string;
  attempts: number;
  blocked: boolean;
  loginFailedDate: Date | null;
};

export { updateLoginControlPropsInput };
