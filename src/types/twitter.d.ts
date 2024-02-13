export type ApiTwitterResponse = {
  media_extended: MediaExtended[];
  replies: number;
  retweets: number;
  text: string;
  tweetID: string;
  user_name: string;
  user_screen_name: string;
};

type MediaExtended = {
  type: 'image' | 'video' | 'gif';
  url: string;
};

export type TwitterResult =
  | {
      isSuccess: true;
      message: string;
      data: {
        name: string;
        username: string;
        text: string;
        replies: number;
        retweets: number;
        media: {
          name: string;
          type: 'image' | 'video' | 'gif';
          url: string;
        }[];
      };
    }
  | {
      isSuccess: false;
      message: string;
    };
