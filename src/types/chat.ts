export type ChatLocale = "es" | "en";

export type ChatRoomType = "community" | "dm";

export type ChatMessageType = "text" | "audio";

export type ChatRoom = {
  id: string;
  type: ChatRoomType;
  name: string;
  memberIds: string[];
  lastMessageAt: string | null;
  lastMessagePreview: string;
  updatedAt: string;
  /** Display title for DMs (other person's name) */
  displayName?: string;
};

export type ChatMessage = {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  type: ChatMessageType;
  text: string;
  sourceLocale: ChatLocale;
  audioPath?: string;
  audioUrl?: string;
  audioDurationMs?: number;
  createdAt: string;
};

export type ChatMember = {
  id: string;
  nombre: string;
  apellido: string;
};

export const COMMUNITY_ROOM_ID = "community";
