declare module 'react-player' {
  import { Component } from 'react';

  interface ReactPlayerProps {
    url: string;
    playing?: boolean;
    controls?: boolean;
    width?: string | number;
    height?: string | number;
    pip?: boolean;
    light?: boolean;
    volume?: number;
    onProgress?: (state: { played: number; playedSeconds: number; loaded: number; loadedSeconds: number }) => void;
    onDuration?: (duration: number) => void;
    onEnded?: () => void;
    onError?: (error: unknown) => void;
    config?: {
      youtube?: {
        playerVars?: Record<string, unknown>;
      };
      vimeo?: {
        playerOptions?: Record<string, unknown>;
      };
      file?: {
        attributes?: {
          controlsList?: string;
          style?: Record<string, string>;
        };
      };
    };
  }

  export default class ReactPlayer extends Component<ReactPlayerProps> {
    seekTo(amount: number, type?: 'seconds' | 'fraction'): void;
  }
} 