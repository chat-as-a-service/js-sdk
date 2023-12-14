import { UserGetRes } from './user.dto';
import { AttachmentRes } from './attachment.dto';

export type MentionType = 'USERS' | 'CHANNEL';

export interface MessageType {
  uuid: string;
  message: string;
  user: UserGetRes;
  channel_uuid: string;
  thread_info?: ThreadInfo;
  reactions: ReactionType[];
  mention_type?: MentionType;
  mentioned_users: UserGetRes[];
  og_tag?: OpenGraphTag;
  attachments: AttachmentRes[];
  parent_message_uuid?: string;
  created_at: number;
  updated_at: number;
}

export interface OpenGraphTag {
  url: string;
  title: string;
  description?: string;
  image?: string;
  image_width?: number;
  image_height?: number;
  image_alt?: string;
}

export interface ThreadInfo {
  reply_count: number;
  most_replies: UserGetRes[];
  last_replied_at: number;
  updated_at: number;
}

export interface ReactionType {
  reaction: string;
  user: UserGetRes;
  created_at: number;
}

export interface CreateMessageReq {
  message: string;
  channel_uuid: string;
  mention_type?: MentionType;
  mentioned_usernames: string[];
  parent_message_uuid?: string;
  attachments: AttachmentEntity[];
}

export interface AttachmentEntity {
  bucket_name: string;
  file_key: string;
  original_file_name: string;
  content_type: string;
}

export interface CreateMessageReplyPayload {
  parent_message_uuid: string;
  channel_uuid: string;
  message: string;
}

export interface LoadPreviousMessagesPayload {
  channel_uuid: string;
  first_message_uuid?: string;
  first_message_ts?: number;
}

export interface LoadPreviousMessagesResponse {
  messages: MessageType[];
  has_previous: boolean;
}

export interface GetMessagePayload {
  channel_uuid: string;
  message_uuid: string;
}

export interface ListThreadPayload {
  channel_uuid: string;
  message_uuid: string;
}
