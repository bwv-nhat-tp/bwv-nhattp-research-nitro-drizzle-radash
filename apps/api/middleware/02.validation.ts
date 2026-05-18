import {
  defineEventHandler,
  getMethod,
  getRequestURL,
  readBody,
} from 'h3';
import { Schema, ValidationError } from 'yup';
import { tryit } from 'radash';
import {
  backendChangePasswordSchema,
  backendLoginSchema,
  backendRegisterSchema,
  baseTransferSchema,
  ERROR_MESSAGES,
  errors,
  updateUserSchema,
} from '@intern/factory';

const validationRoutes: Array<{
  method: string;
  pattern: RegExp;
  schema: Schema;
}> = [
  { method: 'POST', pattern: /^\/auth\/register$/, schema: backendRegisterSchema },
  { method: 'POST', pattern: /^\/auth\/login$/, schema: backendLoginSchema },
  {
    method: 'POST',
    pattern: /^\/auth\/change-password$/,
    schema: backendChangePasswordSchema,
  },
  { method: 'PUT', pattern: /^\/users\/\d+$/, schema: updateUserSchema },
  { method: 'POST', pattern: /^\/transfers$/, schema: baseTransferSchema },
];

function normalizePath(pathname: string) {
  return pathname.replace(/^\/api\/v1(?=\/|$)/, '') || '/';
}

export default defineEventHandler(async (event) => {
  const method = getMethod(event);
  const pathname = normalizePath(getRequestURL(event).pathname);
  const route = validationRoutes.find(
    (item) => item.method === method && item.pattern.test(pathname),
  );

  if (!route) {
    return;
  }

  const body = await readBody(event).catch(() => ({}));
  const validate = () =>
    route.schema.validate(body, {
      abortEarly: false,
      stripUnknown: true,
    });

  const [error, validatedData] = await tryit(validate)();
  if (error) {
    const validationErrors = error instanceof ValidationError ? error.errors : undefined;

    throw new errors.Argument(
      'body',
      ERROR_MESSAGES.VALIDATION_ERROR,
      validationErrors,
    );
  }

  event.context.validatedBody = validatedData;
});
