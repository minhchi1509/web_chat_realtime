import dayjs from 'dayjs';
import { useSessionUserStore } from 'src/store/useSessionUserStore';

import { TConversationMessageResponse } from 'src/types/api/chat/get-conversation-messages.type';
import {
  EMessageType,
  TMessageEmotionResponse
} from 'src/types/api/model.type';

export const formatToConsecutive = (
  messages: TConversationMessageResponse[]
): (TConversationMessageResponse & {
  shouldShowSeperateTime: boolean;
})[][] => {
  if (!messages.length) return [];

  // Clone and reverse the messages array to have oldest first
  const sortedMessages = [...messages].reverse();

  const result: (TConversationMessageResponse & {
    shouldShowSeperateTime: boolean;
  })[][] = [];
  let currentGroup: (TConversationMessageResponse & {
    shouldShowSeperateTime: boolean;
  })[] = [];

  // Process each message (now sorted oldest first)
  sortedMessages.forEach((message, index) => {
    const currentMessage = {
      ...message,
      shouldShowSeperateTime: false
    };

    // The very first message (oldest) should always show time
    if (index === 0) {
      currentMessage.shouldShowSeperateTime = true;
      currentGroup = [currentMessage];
      result.push(currentGroup);
      return;
    }

    const prevMessage = sortedMessages[index - 1]; // Previous message is now actually older
    const timeDifference = Math.abs(
      dayjs(message.createdAt).diff(dayjs(prevMessage.createdAt), 'minute')
    );

    // Set shouldShowSeperateTime if time difference > 5 minutes
    if (timeDifference > 5) {
      currentMessage.shouldShowSeperateTime = true;
    }

    // Start a new group if:
    // 1. Current message is revoked for everyone
    // 2. Current message is a reply to another message
    // 3. Current message is a call type
    // 4. Current message has a different sender than the previous message
    // 5. Time difference > 5 minutes
    // 6. Previous message type is SYSTEM but current isn't, or vice versa
    const shouldStartNewGroup =
      message.isRevokedForEveryone ||
      message.replyToMessage !== null ||
      message.type === EMessageType.CALL ||
      prevMessage.sender?.id !== message.sender?.id ||
      timeDifference > 5 ||
      (prevMessage.type === EMessageType.SYSTEM) !==
        (message.type === EMessageType.SYSTEM);

    if (shouldStartNewGroup) {
      // Start a new group
      currentGroup = [currentMessage];
      result.push(currentGroup);
    } else {
      // Add to current group
      currentGroup.push(currentMessage);
    }
  });

  return result;
};

export const getEmojiDisplayUrl = (emojiCode: string) =>
  `https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/${emojiCode}.png`;

export const sortMessageReactions = (reactions: TMessageEmotionResponse[]) => {
  const formattedReactions: { [key: string]: TMessageEmotionResponse[] } = {};

  reactions.forEach((reaction) => {
    const emojiCode = reaction.emojiCode;
    if (!formattedReactions[emojiCode]) {
      formattedReactions[emojiCode] = [];
    }

    // Convert to MessageEmotionResponseDTO
    const emotionResponse: TMessageEmotionResponse = {
      id: reaction.id,
      emojiCode: reaction.emojiCode,
      participant: {
        id: reaction.participant.id,
        profile: {
          id: reaction.participant.profile.id,
          fullName: reaction.participant.profile.fullName,
          avatar: reaction.participant.profile.avatar
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

  const sortedReactionsKey = ['ALL'];
  reactionCounts.forEach(({ emojiCode }) => {
    sortedReactionsKey.push(emojiCode);
  });

  formattedReactions['ALL'] = reactions;

  return { formattedReactions, sortedReactionsKey };
};

export const isCurrentUser = (userId: string | undefined | null) => {
  const { user } = useSessionUserStore();
  return user.id === userId;
};
