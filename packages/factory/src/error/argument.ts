import { getReasonPhrase, StatusCodes } from 'http-status-codes';
import { isEmpty } from 'radash';

import BWError from './error';

/**
 * ArgumentError
 */
export default class ArgumentError extends BWError {
  public readonly argumentName: string;

  constructor(argumentName: string, message?: string, data?: unknown) {
    const actualMessage =
      message != null && !isEmpty(message)
        ? message
        : `Invalid or missing argument supplied: ${argumentName}.`;

    super(
      getReasonPhrase(StatusCodes.BAD_REQUEST),
      actualMessage,
      StatusCodes.BAD_REQUEST,
      data,
    );

    this.argumentName = argumentName;
  }
}
