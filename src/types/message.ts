import {
  LoadPreviousMessagesPayload,
  LoadPreviousMessagesResponse,
  MessageType,
} from '../dto/message.dto';
import { Socket } from 'socket.io-client';
import { CustomResponse } from '../dto/common.dto';
import { ReactionPayload } from '../dto/reaction.dto';

type User = {
  username: string;
  nickname: string;
};
type ThreadInfo = {
  replyCount: number;
  mostReplies: User[];
  lastRepliedAt: Date;
  updatedAt: Date;
};

type ThreadedMessageListParams = {};

export class Message {
  uuid: string;

  message: string;

  user: User;

  channelUuid: string;

  // reactions: Reaction[];
  // threadInfo: ThreadInfo;

  // mentionedUsers: User[];
  // mentionType?: MentionType;
  // linkPreview?: LinkPreview;
  createdAt: Date;

  updatedAt: Date;

  private readonly socket: Socket;

  // repliesCount: number;
  constructor(message: MessageType, socket: Socket) {
    this.socket = socket;
    this.uuid = message.uuid;
    this.user = message.user;
    this.channelUuid = message.channel_uuid;
    this.message = message.message;
    // this.threadInfo = message.
    // this.reactions = message.reactions;
    // this.mentionedUsers = message.mentionedUsers;
    // this.mentionType = message.mentionType;
    // this.linkPreview = message.linkPreview;
    this.createdAt = new Date(message.created_at);
    this.updatedAt = new Date(message.updated_at);
    // this.repliesCount = message.repliesCount;
  }

  getThreadedMessagesByTimestamp(
    timestamp: number,
    params?: ThreadedMessageListParams,
  ): Promise<MessageType[]> {
    const payload: LoadPreviousMessagesPayload = {
      channel_uuid: this.channelUuid,
      first_message_ts: timestamp,
      parent_message_uuid: this.uuid,
    };
    return new Promise((resolve, reject) => {
      this.socket.emit(
        'message:load-previous',
        payload,
        (res: CustomResponse<LoadPreviousMessagesResponse>) => {
          if (res.result !== 'success' || !res.data) {
            reject(res.error_msg);
            return;
          }
          resolve(res.data.messages);
        },
      );
    });
  }

  addReaction(reaction: string) {
    const payload: ReactionPayload = {
      channel_uuid: this.channelUuid,
      message_uuid: this.uuid,
      reaction,
      op: 'add',
    };
    this.socket.emit('reaction:create-or-delete', payload);
  }

  deleteReaction(reaction: string) {
    const payload: ReactionPayload = {
      channel_uuid: this.channelUuid,
      message_uuid: this.uuid,
      reaction,
      op: 'delete',
    };
    this.socket.emit('reaction:create-or-delete', payload);
  }
}
