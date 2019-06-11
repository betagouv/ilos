import { Container, Exceptions, Types, Interfaces } from '@ilos/core';
import { reduceRoles } from '../helpers/reduceRoles';

/**
 * Check role, may throw a ForbiddenException of a InvalidParamsException
 * @export
 * @param {...string[]} roles
 * @returns {MiddlewareInterface}
 */
@Container.middleware()
export class RoleMiddleware implements Interfaces.MiddlewareInterface {
  async process(params: Types.ParamsType, context: Types.ContextType, next: Function, roles: string[]): Promise<Types.ResultType> {
    const filtered: string[] = roles.filter(i => !!i);

    if (!filtered.length) {
      throw new Exceptions.InvalidParamsException('No role defined');
    }

    if (!('call' in context) || (!('role' in context.call.user) && !('group' in context.call.user))) {
      throw new Exceptions.ForbiddenException('Invalid permissions');
    }

    const { role, group } = context.call.user;

    const pass = filtered.reduce(reduceRoles(filtered, group, role), true);

    if (!pass) {
      throw new Exceptions.ForbiddenException('Role mismatch');
    }

    return next(params, context);
  }
}
