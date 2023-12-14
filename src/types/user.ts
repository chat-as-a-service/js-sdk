export class User {
  readonly username: string;
  nickname: string;

  constructor(username: string, nickname: string) {
    this.username = username;
    this.nickname = nickname;
  }
}
