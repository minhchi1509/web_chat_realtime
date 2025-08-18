import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  Type
} from '@nestjs/common';
import { ModuleRef, Reflector } from '@nestjs/core';

import { TExtendedPrismaClient } from 'src/common/configs/prisma.config';
import { EMetadataKey } from 'src/common/constants/common.enum';
import { EProviderKey } from 'src/common/constants/provider-key.enum';
import { IRequest } from 'src/common/types/common.type';
import { IPolicyHandler } from 'src/common/types/policy.type';
import { ConversationAbilityFactory } from 'src/modules/libs/casl/factories/conversation.factory';

@Injectable()
export class ConversationPolicyGuard implements CanActivate {
  constructor(
    private moduleRef: ModuleRef,
    private reflector: Reflector,
    private abilityFactory: ConversationAbilityFactory,
    @Inject(EProviderKey.PRISMA_PROVIDER)
    private prismaService: TExtendedPrismaClient
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<IRequest>();
    const policy = this.reflector.getAllAndOverride<
      Type<IPolicyHandler[]> | undefined
    >(EMetadataKey.CHECK_POLICIES_KEY, [
      context.getClass(),
      context.getHandler()
    ]);

    const { conversationId } = request.params;
    const { user } = request;

    const conversationMember = await this.prismaService.conversationParticipant
      .findFirstOrThrow({
        where: {
          conversationId,
          userId: user.sub,
          leftAt: null
        }
      })
      .catch(() => {
        throw new ForbiddenException(
          'User is not a member of the conversation'
        );
      });

    if (!policy) {
      return true;
    }

    const participantAbility =
      this.abilityFactory.createForParticipant(conversationMember);
    const policyHandlers = this.moduleRef.get(policy, { strict: false });

    const isEligible = await Promise.all(
      policyHandlers.map((handler) =>
        handler.handle(participantAbility, request)
      )
    );

    if (isEligible.some((result) => !result)) {
      throw new ForbiddenException(
        'You do not have permission to perform this action'
      );
    }

    return true;
  }
}
