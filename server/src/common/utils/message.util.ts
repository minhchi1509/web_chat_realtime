import { ConversationParticipant, MessageEmotion, User } from '@prisma/client';

import { MessageReactionsDataDTO } from 'src/common/dto/ConversationMessageResponse.dto';
import { MessageEmotionResponseDTO } from 'src/common/dto/MessageEmotionResponse.dto';

export const formatMessageReactions = (
  reactions: (MessageEmotion & {
    participant: ConversationParticipant & { user: User };
  })[]
): MessageReactionsDataDTO => {
  // Group reactions by emoji code
  const formattedReactions: { [key: string]: MessageEmotionResponseDTO[] } = {};

  reactions.forEach((reaction) => {
    const emojiCode = reaction.emojiCode;
    if (!formattedReactions[emojiCode]) {
      formattedReactions[emojiCode] = [];
    }

    // Convert to MessageEmotionResponseDTO
    const emotionResponse: MessageEmotionResponseDTO = {
      id: reaction.id,
      emojiCode: reaction.emojiCode,
      participant: {
        id: reaction.participant.id,
        profile: {
          id: reaction.participant.user.id,
          fullName: reaction.participant.user.fullName,
          avatar: reaction.participant.user.avatar
        },
        role: reaction.participant.role
      },
      createdAt: reaction.createdAt
    };

    formattedReactions[emojiCode].push(emotionResponse);
  });

  // Calculate counts for each reaction type
  const reactionCounts = Object.entries(formattedReactions).map(
    ([emojiCode, reactions]) => ({
      emojiCode,
      count: reactions.length,
      latestReactionDate: new Date(
        Math.max(...reactions.map((r) => new Date(r.createdAt).getTime()))
      )
    })
  );

  // Sort reaction types by count (descending) and then by latest reaction date (descending)
  reactionCounts.sort((a, b) => {
    if (a.count !== b.count) {
      return b.count - a.count;
    }
    return b.latestReactionDate.getTime() - a.latestReactionDate.getTime();
  });

  // Get top 3 reactions
  const topReactions = reactionCounts.slice(0, 3).map((r) => r.emojiCode);

  // Create sorted reactions object
  const sortedReactions: { [key: string]: MessageEmotionResponseDTO[] } = {};
  reactionCounts.forEach(({ emojiCode }) => {
    // We can safely use non-null assertion since we know these keys exist from reactionCounts
    sortedReactions[emojiCode] = formattedReactions[emojiCode]!;
  });

  return {
    total: reactions.length,
    topReactions,
    sortedReactions
  };
};
