export interface IVoteUser {
  image: string;
  name: string;
  userId: string;
}

export interface IVoteList {
  text: string;
  value: string;
  voted?: IVoteUser[];
  userId: string;
  userImage?: string;
  userName?: string;
}
