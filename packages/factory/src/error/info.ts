import { getReasonPhrase, StatusCodes } from 'http-status-codes';

import BWError from './error';

/**
 * Info object / not a actual arror
 */
export default class Info extends BWError {
  public readonly argumentName: string;

  constructor(argumentName: string, message: string) {
    const actualMessage = message;

    super(getReasonPhrase(StatusCodes.OK), actualMessage, StatusCodes.OK);

    this.argumentName = argumentName;
  }
}
