import { getReasonPhrase, StatusCodes } from 'http-status-codes';
import { isEmpty } from 'radash';

import { ERROR_MESSAGES } from '../constants/messages.constant';
import BWError from './error';

/**
 * NotFoundError
 */
export default class NotFoundError extends BWError {
  constructor(message?: string) {
    const actualMessage =
      message != null && !isEmpty(message) ? message : ERROR_MESSAGES.NOT_FOUND;

    super(
      getReasonPhrase(StatusCodes.NOT_FOUND),
      actualMessage,
      StatusCodes.NOT_FOUND,
    );
  }
}
