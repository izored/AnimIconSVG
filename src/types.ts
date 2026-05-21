export interface IconMeta {
  name: string;
}

export interface Settings {
  insertMode: 'motion' | 'svg' | 'animated';
  defaultSize: number;
  defaultColor: string;
  defaultStyle: 'fill' | 'stroke';
  theme: 'light' | 'dark';
}

export type View = 'grid' | 'settings' | 'info';

export type Category = 'all' | 'arrows' | 'brand' | 'social' | 'letters' | 'tech';