export const SOCKET_EVENTS_NAME_TO_CLIENT = {
  CHAT: {
    USER_ACTIVITY_STATUS: 'user_activity_status',
    NEW_USER_SEEN_MESSAGE: 'new_seen_message',
    NEW_CONVERSATION_MESSAGE: 'new_conversation_message',
    NEW_MESSAGE_EMOTION: 'new_message_emotion'
  }
};

export const SUBSCRIBED_SOCKET_EVENTS_NAME = {
  CHAT: {
    USER_MARK_SEEN_MESSAGE: 'user_mark_seen_message'
  }
};
