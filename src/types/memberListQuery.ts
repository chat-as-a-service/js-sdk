import { Socket } from 'socket.io-client';
import {
  ChannelMemberListPayload,
  ChannelMemberListRes,
} from '../dto/channel.dto';
import { CustomResponse } from '../dto/common.dto';
import { type ChannelMember } from './channel';

export type MemberListQueryOrder =
  | 'MEMBER_NICKNAME_ALPHABETICAL'
  | 'OPERATOR_THEN_MEMBER_ALPHABETICAL';

export class MemberListQuery {
  private readonly socket: Socket;
  private readonly channelUuid: string;
  private readonly limit: number;
  private order: MemberListQueryOrder;
  private nextToken: number = 0;

  constructor(
    socket: Socket,
    channelUuid: string,
    limit: number,
    order: 'MEMBER_NICKNAME_ALPHABETICAL' | 'OPERATOR_THEN_MEMBER_ALPHABETICAL',
  ) {
    this.socket = socket;
    this.channelUuid = channelUuid;
    this.limit = limit;
    this.order = order;
  }

  async next(): Promise<ChannelMember[]> {
    return new Promise((resolve, reject) => {
      const payload: ChannelMemberListPayload = {
        channel_uuid: this.channelUuid,
        order: this.order,
        limit: this.limit,
        token: this.nextToken,
      };
      this.socket.emit(
        'channel:list-members',
        payload,
        (res: CustomResponse<ChannelMemberListRes>) => {
          if (res.result !== 'success' || res.data == null) {
            reject(res.error_msg);
          } else {
            this.nextToken = res.data.next;
            resolve(
              res.data.members.map(m => ({
                username: m.username,
                nickname: m.nickname,
                isOperator: m.is_operator,
                isOnline: m.is_online,
                lastSeenAt: m.last_seen_at,
              })),
            );
          }
        },
      );
    });
  }
}
