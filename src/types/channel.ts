import { Socket } from 'socket.io-client';
import { CustomResponse } from '../dto/common.dto';
import {
  AttachmentEntity,
  CreateMessageReq,
  MessageType,
} from '../dto/message.dto';
import { MessageCollection } from './messageCollection';
import {
  NewAttachmentUploadSignedUrlPayload,
  NewAttachmentUploadSignedUrlResponse,
} from '../dto/attachment.dto';
import { Attachment } from './attachment'; // import axios from 'axios';
// import axios from 'axios';

export type MessageCreateParams = {
  message: string;
  attachments: AttachmentEntity[];
  parentMessageUuid?: string;
};

export type MessageCollectionParams = {
  startingPoint?: number;
  prevResultLimit?: number;
  nextResultLimit?: number;
};
export type MentionType = 'USERS' | 'CHANNEL';

export type SendMessageParams = {
  message: string;
  mentionType?: MentionType;
  mentionedUsernames?: string[];
};

export type RequestAttachmentUploadSignedUrlParams = {
  fileName: string;
  fileType: string;
  fileContentLength: number;
};

export class Channel {
  readonly socket: Socket;
  readonly uuid: string;
  name: string;
  readonly created_at: number;
  updated_at: number;
  entered: boolean = false;

  constructor(
    socket: Socket,
    uuid: string,
    name: string,
    created_at: number,
    updated_at: number,
  ) {
    this.socket = socket;
    this.uuid = uuid;
    this.name = name;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }

  async enter() {
    return new Promise((resolve, reject) => {
      this.socket.emit(
        'channel:join',
        this.uuid,
        (res: CustomResponse<MessageType[]>) => {
          if (res.result !== 'success') {
            reject(res.error_msg);
          } else {
            this.entered = true;
            resolve('');
          }
        },
      );
    });
  }

  async sendMessage(params: MessageCreateParams): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.entered) {
        reject(new Error('You must enter the channel first'));
        return;
      }
      const reqDto: CreateMessageReq = {
        message: params.message,
        channel_uuid: this.uuid,
        mentioned_usernames: [],
        attachments: params.attachments,
        parent_message_uuid: params.parentMessageUuid,
      };
      this.socket.emit(
        'message:create',
        reqDto,
        (res: CustomResponse<MessageType>) => {
          if (res.result !== 'success') {
            reject(res.error_msg);
          } else {
            resolve();
          }
        },
      );
    });
  }

  createMessageCollection(params: MessageCollectionParams): MessageCollection {
    return new MessageCollection(
      this,
      params.startingPoint,
      params.prevResultLimit,
      params.nextResultLimit,
    );
  }

  async uploadFile(file: File): Promise<Attachment> {
    const payload: NewAttachmentUploadSignedUrlPayload = {
      file_name: file.name,
      file_type: file.type,
      file_content_length: file.size ?? 0,
      channel_uuid: this.uuid,
    };
    return new Promise((resolve, reject) => {
      this.socket.emit(
        'attachment:request-upload-signed-url',
        payload,
        async (
          response: CustomResponse<NewAttachmentUploadSignedUrlResponse>,
        ) => {
          if (response.result === 'error') {
            reject(new Error(response.error_msg));
            return;
          }

          const {
            upload_signed_url,
            download_signed_url,
            headers,
            content_type,
            file_key,
            bucket,
          } = response.data!;
          const uploadResponse = await fetch(upload_signed_url, {
            method: 'PUT',
            body: file,
            headers: {
              'Content-Type': content_type,
              ...headers,
            },
          });

          if (uploadResponse.status === 200) {
            const attachment = new Attachment(
              download_signed_url,
              file_key,
              bucket,
              content_type,
              file,
            );
            resolve(attachment);
          } else {
            reject(new Error('Failed to upload file.'));
          }
        },
      );
    });
  }
}
