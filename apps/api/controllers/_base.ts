import {
  defineEventHandler,
  getQuery,
  getRouterParam,
  H3Event,
  setResponseHeader,
  setResponseStatus,
} from 'h3';
import { BWError, errors, HttpStatus } from '@intern/factory';
import { isEmpty } from 'radash';

type ControllerHandler<T> = (event: H3Event) => Promise<T> | T;

function isAppError(error: unknown): error is BWError {
  return (
    error instanceof BWError ||
    (
      typeof error === 'object' &&
      error !== null &&
      'httpStatus' in error &&
      'reason' in error &&
      'message' in error
    )
  );
}

export default abstract class BaseController {
  protected define<T>(mainFunction: ControllerHandler<T>) {
    return defineEventHandler(async (event) => {
      try {
        return await mainFunction(event);
      } catch (error) {
        if (!isAppError(error)) {
          throw error;
        }

        setResponseStatus(event, error.httpStatus);

        return {
          message: error.message,
          ...(error.data !== undefined ? { errors: error.data } : {}),
        };
      }
    });
  }

  protected ok<T>(event: H3Event, data: { rows: T; count?: number }) {
    if (data.count !== undefined) {
      setResponseHeader(event, 'X-Total-Count', String(data.count));
    }

    return data.rows;
  }

  protected created<T>(event: H3Event, result?: T) {
    setResponseStatus(event, HttpStatus.CREATED);
    return result;
  }

  protected noContent(event: H3Event) {
    setResponseStatus(event, HttpStatus.NO_CONTENT);
  }

  protected getNumberParam(event: H3Event, name: string) {
    const value = Number(getRouterParam(event, name));
    if (Number.isNaN(value)) {
      throw new errors.Argument(name);
    }

    return value;
  }

  protected getPagination(event: H3Event) {
    const query = getQuery(event);

    return {
      page: Number(query.page) || 1,
      limit: Number(query.limit) || 10,
    };
  }

  protected getQueryString(event: H3Event, name: string) {
    const value = getQuery(event)[name];
    if (value == null) {
      return undefined;
    }

    const text = String(value);
    return isEmpty(text) ? undefined : text;
  }

  protected getAuthUser<T = { id: number }>(event: H3Event) {
    const user = event.context.user as T | undefined;
    if (!user) {
      throw new errors.Unauthorized();
    }

    return user;
  }

  protected getValidatedBody<T>(event: H3Event) {
    const body = event.context.validatedBody as T | undefined;
    if (!body) {
      throw new errors.Argument('body');
    }

    return body;
  }
}
