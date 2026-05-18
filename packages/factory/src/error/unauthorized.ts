import { getReasonPhrase, StatusCodes } from 'http-status-codes';
import { isEmpty } from 'radash';

import { ERROR_MESSAGES } from '../constants/messages.constant';
import BWError from './error';

/**
 * UnauthorizedError
 */
export default class UnauthorizedError extends BWError {
  constructor(message?: string) {
    const actualMessage =
      message != null && !isEmpty(message) ? message : ERROR_MESSAGES.UNAUTHORIZED;

    super(
      getReasonPhrase(StatusCodes.UNAUTHORIZED),
      actualMessage,
      StatusCodes.UNAUTHORIZED,
    );
  }
}
