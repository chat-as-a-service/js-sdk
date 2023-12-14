export class Attachment {
  private _url?: string;

  private _fileKey: string;
  private _bucket: string;
  private _contentType: string;
  private readonly file: File;

  constructor(
    url: string,
    fileKey: string,
    bucket: string,
    contentType: string,
    file: File,
  ) {
    this._url = url;
    this._fileKey = fileKey;
    this._bucket = bucket;
    this._contentType = contentType;
    this.file = file;
  }

  get url(): string | undefined {
    return this._url;
  }

  set url(value: string) {
    this._url = value;
  }

  get fileKey(): string {
    return this._fileKey;
  }

  set fileKey(value: string) {
    this._fileKey = value;
  }

  get bucket(): string {
    return this._bucket;
  }

  set bucket(value: string) {
    this._bucket = value;
  }

  get contentType(): string {
    return this._contentType;
  }

  set contentType(value: string) {
    this._contentType = value;
  }
}
