import { CreateUserRequestModel } from "@http/dtos/user/CreateUserRequestModel";
import { CreateUserResponseModel } from "@http/dtos/user/CreateUserResponseModel";

class CreateUserService {
  public async execute({
    confirmPassword,
    email,
    name,
    password,
  }: CreateUserRequestModel): Promise<CreateUserResponseModel> {
    console.log(confirmPassword, email, name, password);

    return {
      accessToken: "",
      refreshToken: "",
    };
  }
}

export { CreateUserService };
