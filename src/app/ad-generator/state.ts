import type { PaperFormat } from '@/utils/layout';

export interface AppState {
  debugMode: boolean;
  paperFormat: PaperFormat;
  fontSize: number;
  verticalPosition: number;
  editorContent: string;
}

export const initialState: AppState = {
  debugMode: false,
  paperFormat: 'a4-portrait',
  fontSize: 50,
  verticalPosition: 50,
  editorContent: '',
};
