import { NextFunction, Request, Response } from "express";

import { IResponseMessage } from "./IResponseMessage";

interface IMiddlewareWithError<T = any> {
  (
    err: Error,
    req: Request,
    res: Response<IResponseMessage<T>>,
    next: NextFunction
  ): Promise<void | Response>;
}

export { IMiddlewareWithError };
