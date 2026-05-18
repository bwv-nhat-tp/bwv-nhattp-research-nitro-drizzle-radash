import { defineNitroPlugin } from 'nitropack/runtime/plugin';
import { H3Error } from 'h3';
import { BWError, ERROR_MESSAGES, HttpStatus } from '@intern/factory';

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

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('error', (error, { event }) => {
    if (!event) return;

    const h3Error = error as H3Error;
    const statusCode = isAppError(error)
      ? error.httpStatus
      : h3Error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR;
    const message = isAppError(error)
      ? error.message
      : h3Error.statusMessage || ERROR_MESSAGES.INTERNAL_SERVER_ERROR;
    const data = isAppError(error) ? error.data : h3Error.data;

    const response = {
      message,
      ...(data !== undefined ? { errors: data } : {}),
    };

    event.node.res.setHeader('Content-Type', 'application/json');
    event.node.res.statusCode = statusCode;
    event.node.res.end(JSON.stringify(response));
  });
});
