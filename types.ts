// types.ts
export interface IconData {
  name: string;
  url: string;
  id: string | number;

  raster_sizes?: {
    formats?: {
      preview_url?: string;
      [key: string]: any;
    }[];
    [key: string]: any;
  }[];
  tags?: string[];
};