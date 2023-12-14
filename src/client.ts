import { io } from 'socket.io-client';
import { UserGetRes } from './dto/user.dto';
import { User } from './types/user';
import { ChannelGetRes, ChannelListRes } from './dto/channel.dto';
import { Channel } from './types/channel';
import { CustomResponse } from './dto/common.dto';
import { GetMessagePayload, MessageType } from './dto/message.dto';
import { Message } from './types/message';

export type ClientInitOptions = {
  appUuid: string;
  serverUrl?: string;
};
export type ClientConnectOptions = {
  username: string;
  authToken: string;
};

export type MessageRetrievalParams = {
  channelUuid: string;
  messageUuid: string;
};

export class WingFloClient {
  appUuid: string;
  username?: string;
  authToken?: string;
  socket = io('http://localhost:4000', {
    autoConnect: false,
    transports: ['websocket'],
  });

  private constructor(appUuid: string) {
    this.appUuid = appUuid;
  }

  static init(options: ClientInitOptions) {
    const client = new WingFloClient(options.appUuid);
    if (options.serverUrl != null) {
      client.socket = io(options.serverUrl, {
        autoConnect: false,
        transports: ['websocket'],
      });
    }
    return client;
  }

  async connect(options: ClientConnectOptions) {
    this.username = options.username;
    this.authToken = options.authToken;
    this.socket.auth = {
      token: this.authToken,
    };
    this.socket.connect();
    await new Promise((resolve, reject) => {
      this.socket.on('connect', () => {
        console.log('connected');
        resolve('');
        this.socket.removeListener('connect');
      });
    });

    return new Promise((resolve, reject) => {
      this.socket.emit('user:who-am-i', (user: UserGetRes) => {
        console.log('Received user', user);
        resolve(new User(user.username, user.nickname));
      });
    });
  }

  getChannel(channelUuid: string): Promise<Channel> {
    return new Promise((resolve, reject) => {
      this.socket.emit(
        'channel:get',
        channelUuid,
        (res: CustomResponse<ChannelGetRes>) => {
          if (res.result !== 'success' || !res.data) {
            reject(res.error_msg);
          } else {
            const channel = res.data;
            resolve(
              new Channel(
                this.socket,
                channel.uuid,
                channel.name,
                channel.created_at,
                channel.updated_at,
              ),
            );
          }
        },
      );
    });
  }

  listChannels(): Promise<ChannelListRes[]> {
    return new Promise((resolve, reject) => {
      this.socket.emit(
        'channel:list',
        (res: CustomResponse<ChannelListRes[]>) => {
          if (res.result !== 'success' || !res.data) {
            reject(res.error_msg);
          } else {
            resolve(res.data);
          }
        },
      );
    });
  }

  getMessage(params: MessageRetrievalParams): Promise<Message> {
    const payload: GetMessagePayload = {
      channel_uuid: params.channelUuid,
      message_uuid: params.messageUuid,
    };
    return new Promise((resolve, reject) => {
      this.socket.emit(
        'message:get',
        payload,
        (res: CustomResponse<MessageType>) => {
          if (res.result !== 'success' || !res.data) {
            reject(res.error_msg);
          } else {
            const message = new Message(res.data, this.socket);
            resolve(message);
          }
        },
      );
    });
  }

  disconnect() {
    this.socket.disconnect();
  }
}
