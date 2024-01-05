import { Channel } from './channel';
import {
  LoadPreviousMessagesPayload,
  LoadPreviousMessagesResponse,
  MessageType,
} from '../dto/message.dto';
import { CustomResponse } from '../dto/common.dto';

const DEFAULT_PREV_RESULT_LIMIT = 100;
const DEFAULT_NEXT_RESULT_LIMIT = 100;

export type MessageCollectionEventHandler = {
  onMessagesReceived?: (channel: Channel, messages: MessageType[]) => void;
  onMessagesUpdated?: (channel: Channel, messages: MessageType[]) => void;
  onMessageDeleted?: (channel: Channel, messageUuid: string) => void;
};

export class MessageCollection {
  readonly channel: Channel;
  private readonly startingPoint: number;
  private prevResultLimit: number;
  private nextResultLimit: number;

  private _hasNext: boolean = false;

  private _hasPrevious: boolean = false;

  private _newMessageListener?: (message: MessageType) => void;
  private _updateMessageListener?: (message: MessageType) => void;
  private _deleteMessageListener?: (messageUuid: string) => void;

  private _messages: MessageType[] = [];

  constructor(
    channel: Channel,
    startingPoint: number = Date.now(),
    prevResultLimit: number = DEFAULT_PREV_RESULT_LIMIT,
    nextResultLimit: number = DEFAULT_NEXT_RESULT_LIMIT,
  ) {
    this.channel = channel;
    this.startingPoint = startingPoint;
    this.prevResultLimit = prevResultLimit;
    this.nextResultLimit = nextResultLimit;
  }

  async loadPrevious(): Promise<MessageType[]> {
    const payload: LoadPreviousMessagesPayload = {
      channel_uuid: this.channel.uuid,
      first_message_ts: this.startingPoint,
    };
    return new Promise((resolve, reject) => {
      this.channel.socket.emit(
        'message:load-previous',
        payload,
        (res: CustomResponse<LoadPreviousMessagesResponse>) => {
          if (res.result !== 'success' || !res.data) {
            reject(res.error_msg);
            return;
          }
          this._hasPrevious = res.data?.has_previous;
          resolve(res.data.messages);
        },
      );
    });
  }

  async loadNext() {}

  setMessageCollectionHandler(eventHandler: MessageCollectionEventHandler) {
    this.dispose();
    if (eventHandler.onMessagesReceived != null) {
      this._newMessageListener = (message: MessageType) => {
        eventHandler.onMessagesReceived?.(this.channel, [message]);
      };
      this.channel.socket.on('message:new', this._newMessageListener);
    }
    if (eventHandler.onMessagesUpdated != null) {
      this._updateMessageListener = (message: MessageType) => {
        eventHandler.onMessagesUpdated?.(this.channel, [message]);
      };
      this.channel.socket.on('message:updated', this._updateMessageListener);
    }
    if (eventHandler.onMessageDeleted != null) {
      this._deleteMessageListener = messageUuid => {
        eventHandler.onMessageDeleted?.(this.channel, messageUuid);
      };
      this.channel.socket.on('message:deleted', this._deleteMessageListener);
    }
  }

  get hasNext() {
    return this._hasNext;
  }

  get getPrevious() {
    return this._hasPrevious;
  }

  get messages(): MessageType[] {
    return this._messages;
  }

  dispose() {
    if (this._newMessageListener) {
      this.channel.socket.off('message:new', this._newMessageListener);
    }
    if (this._updateMessageListener) {
      this.channel.socket.off('message:new', this._updateMessageListener);
    }
  }
}
