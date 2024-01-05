export interface ReactionPayload {
  channel_uuid: string;
  message_uuid: string;
  reaction: string;
  op: 'add' | 'delete';
}
