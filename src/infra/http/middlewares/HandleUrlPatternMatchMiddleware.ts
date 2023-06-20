import { getMessage } from "@helpers/translatedMessagesControl";
import { IMiddleware } from "@http/models/IMiddleware";
import { HttpStatus } from "@http/utils/HttpStatus";
import { logger } from "@infra/log";

class HandleUrlPatternMatchMiddleware {
  public setHasUrlMatched =
    (hasUrlPatternMatched = true): IMiddleware =>
    async (req, _, next) => {
      Object.assign(req, { hasUrlPatternMatched });
      return next();
    };

  public skipIfHasUrlMatched: IMiddleware = async (
    { hasUrlPatternMatched },
    _,
    next
  ) => {
    if (hasUrlPatternMatched) return next("route");

    return next();
  };

  public verify: IMiddleware<{
    route: string;
    method: string;
  }> = async (
    { originalUrl: route, method, hasUrlPatternMatched },
    res,
    next
  ) => {
    if (hasUrlPatternMatched) return next();

    logger.info(
      `Access attempt to non-existent route: ${route} with ${method} method`
    );

    res.status(HttpStatus.NOT_FOUND).json({
      message: getMessage("ErrorRouteNotFound"),
      success: false,
      content: {
        route,
        method,
      },
    });

    return next();
  };
}

export { HandleUrlPatternMatchMiddleware };
