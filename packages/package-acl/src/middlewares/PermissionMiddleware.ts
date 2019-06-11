import { Container, Exceptions, Interfaces, Types } from '@ilos/core';

/**
 * Can middleware check permission in context and may throw a ForbiddenException
 *
 * @export
 * @param {...string[]} roles
 * @returns {MiddlewareInterface}
 */
@Container.middleware()
export class PermissionMiddleware implements Interfaces.MiddlewareInterface {
  async process(
    params: Types.ParamsType,
    context: Types.ContextType,
    next: Function,
    neededPermissions: string[],
  ): Promise<Types.ResultType> {
    if (!Array.isArray(neededPermissions) || neededPermissions.length === 0) {
      throw new Exceptions.InvalidParamsException('No permissions defined');
    }

    if (!context || !('call' in context) || !('permissions' in context.call.user)) {
      throw new Exceptions.ForbiddenException('Invalid permissions');
    }

    const { permissions } = context.call.user;
    const pass = neededPermissions.reduce((p, c) => p && (permissions || []).indexOf(c) > -1, true);

    if (!pass) {
      throw new Exceptions.ForbiddenException('Invalid permissions');
    }

    return next(params, context);
  }
}
