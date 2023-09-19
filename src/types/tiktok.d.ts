export type ApiTiklyDownResponse = {
  id: number;
  title: string;
  url: string;
  created_at: string;
  video?: {
    noWatermark: string;
    watermark: string;
    width: number;
    height: number;
    duration: number;
  };
  images?: { url: string; width: number; height: number }[];
  author: { id: string; name: string; unique_id: string };
};
