import { H3Event, getHeader } from 'h3';
import { last, tryit } from 'radash';
import jwt from 'jsonwebtoken';
import { UserRepository } from '@intern/domain';
import { ERROR_MESSAGES, errors } from '@intern/factory';

export async function requireAuth(event: H3Event) {
  const authHeader = getHeader(event, 'authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new errors.Unauthorized();
  }
  
  const token = last(authHeader.split(' '));
  if (!token) {
    throw new errors.Unauthorized();
  }

  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) {
    throw new errors.Error((ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
  }

  const [jwtError, decoded] = tryit(() => jwt.verify(token, secret) as { id: number })();
  
  if (jwtError) {
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
  return user;
}
