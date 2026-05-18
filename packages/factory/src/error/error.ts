import { StatusCodes } from 'http-status-codes';

import { ERROR_MESSAGES } from '../constants/messages.constant';

/**
 * Base application error.
 */
export default class BWError extends Error {
  public readonly reason: string;
  public readonly httpStatus: StatusCodes;
  public readonly data?: unknown;

  constructor(
    code: string,
    message: string = ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    httpStatus = StatusCodes.INTERNAL_SERVER_ERROR,
    data?: unknown,
  ) {
    super(message);

    this.name = 'BWError';
    this.httpStatus = httpStatus;
    this.reason = code;
    this.data = data;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
