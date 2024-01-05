export interface ChannelGetRes {
  uuid: string;
  name: string;
  created_at: number;
  updated_at: number;
}

export interface ChannelListRes {
  uuid: string;
  name: string;
  user_count: number;
  max_members: number;
  created_at: number;
  updated_at: number;
}

export interface ChannelMemberListPayload {
  channel_uuid: string;
  order?: string;
  limit?: number;
  token?: number;
}

export interface ChannelMember {
  username: string;
  nickname: string;
  is_online: boolean;
  is_operator: boolean;
  last_seen_at?: number;
}

export interface ChannelMemberListRes {
  members: ChannelMember[];
  next: number;
}
