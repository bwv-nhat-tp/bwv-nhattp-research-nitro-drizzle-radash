import {
  defineEventHandler,
  getHeader,
  getMethod,
  getRequestURL,
} from 'h3';
import jwt from 'jsonwebtoken';
import { last, tryit } from 'radash';
import { UserRepository } from '@intern/domain';
import { ERROR_MESSAGES, errors } from '@intern/factory';

const publicRoutes = [
  { method: 'GET', pattern: /^\/health$/ },
  { method: 'POST', pattern: /^\/auth\/login$/ },
  { method: 'POST', pattern: /^\/auth\/register$/ },
];

function normalizePath(pathname: string) {
  return pathname.replace(/^\/api\/v1(?=\/|$)/, '') || '/';
}

function isPublicRoute(method: string, pathname: string) {
  return publicRoutes.some(
    (route) => route.method === method && route.pattern.test(pathname),
  );
}

export default defineEventHandler(async (event) => {
  const method = getMethod(event);
  if (method === 'OPTIONS') {
    return;
  }

  const pathname = normalizePath(getRequestURL(event).pathname);
  if (isPublicRoute(method, pathname)) {
    return;
  }

  const authHeader = getHeader(event, 'authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw new errors.Unauthorized();
  }

  const token = last(authHeader.split(' '));
  if (!token) {
    throw new errors.Unauthorized();
  }

  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) {
    throw new errors.Error(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
  }

  const [jwtError, decoded] = tryit(
    () => jwt.verify(token, secret) as { id: number },
  )();
  if (jwtError || !decoded?.id) {
    throw new errors.Unauthorized();
  }

  const [dbError, user] = await tryit(() => UserRepository.findById(decoded.id))();
  if (dbError) {
    throw new errors.Error(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
  }

  if (!user) {
    throw new errors.Unauthorized();
  }

  event.context.user = user;
});
