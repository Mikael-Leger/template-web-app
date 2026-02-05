export interface NavbarItem {
  id: string;
  title: string;
  url: string;
  main?: boolean;
  image?: string;
  icon?: string;
  separator?: boolean;
  order: number;
}

export type ScrollEffect = 'none' | 'shrink' | 'color-change' | 'hide-on-scroll' | 'shrink-and-color';
export type ShadowSize = 'none' | 'sm' | 'md' | 'lg';
export type TextTransform = 'none' | 'uppercase' | 'capitalize';

export interface NavbarConfig {
  id: string;
  logo: {
    type: 'image' | 'text';
    imageUrl: string;
    text: string;
    height: string;
  };
  items: NavbarItem[];
  appearance: {
    height: string;
    heightScrolled: string;
    backgroundColor: string;
    backgroundColorScrolled: string;
    textColor: string;
    textColorScrolled: string;
    activeColor: string;
    hoverColor: string;
    borderBottom: boolean;
    backdropBlur: boolean;
    shadow: ShadowSize;
  };
  behavior: {
    sticky: boolean;
    scrollEffect: ScrollEffect;
    scrollThreshold: number;
    mobileBreakpoint: number;
  };
  typography: {
    fontSize: string;
    fontWeight: string;
    textTransform: TextTransform;
    letterSpacing: string;
  };
  updatedAt: string;
}