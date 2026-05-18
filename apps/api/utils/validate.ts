import { H3Event, readBody } from 'h3';
import { Schema, InferType, ValidationError } from 'yup';
import { ERROR_MESSAGES, errors } from '@intern/factory';
import { tryit } from 'radash';

export async function validateBody<T extends Schema>(
  event: H3Event, 
  schema: T
): Promise<InferType<T>> {
  const body = await readBody(event).catch(() => ({}));
  const validate = () => schema.validate(body, { abortEarly: false, stripUnknown: true });
  const [error, validatedData] = await tryit(validate)();

  if (error) {
    const validationErrors = error instanceof ValidationError ? error.errors : undefined;

    throw new errors.Argument(
      'body',
      ERROR_MESSAGES.VALIDATION_ERROR,
      validationErrors,
    );
  }
  return validatedData;
}
