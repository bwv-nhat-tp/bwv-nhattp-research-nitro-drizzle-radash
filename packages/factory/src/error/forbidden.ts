import { getReasonPhrase, StatusCodes } from 'http-status-codes';
import { isEmpty } from 'radash';

import { ERROR_MESSAGES } from '../constants/messages.constant';
import BWError from './error';

/**
 * ForbiddenError
 */
export default class ForbiddenError extends BWError {
  constructor(message?: string) {
    const actualMessage =
      message != null && !isEmpty(message) ? message : ERROR_MESSAGES.FORBIDDEN;

    super(
      getReasonPhrase(StatusCodes.FORBIDDEN),
      actualMessage,
      StatusCodes.FORBIDDEN,
    );
  }
}
