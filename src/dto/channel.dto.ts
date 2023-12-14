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
