import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUserFromToken = createParamDecorator(
  (data: keyof any | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    return data ? user?.[data] : user; // Return specific property if `data` is provided, otherwise return full user
  },
);
