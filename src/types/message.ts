import { ListThreadPayload, MessageType } from '../dto/message.dto';
import { Socket } from 'socket.io-client';
import { CustomResponse } from '../dto/common.dto';

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
    params: ThreadedMessageListParams,
  ): Promise<MessageType[]> {
    const payload: ListThreadPayload = {
      channel_uuid: this.channelUuid,
      message_uuid: this.uuid,
    };
    return new Promise((resolve, reject) => {
      this.socket.emit(
        'message:list-thread',
        payload,
        (res: CustomResponse<MessageType[]>) => {
          if (res.result !== 'success' || !res.data) {
            reject(res.error_msg);
            return;
          }
          resolve(res.data);
        },
      );
    });
  }
}
