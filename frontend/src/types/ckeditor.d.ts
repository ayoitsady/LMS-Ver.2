declare module '@ckeditor/ckeditor5-react' {
  import { ComponentType } from 'react';
  
  interface EditorInstance {
    getData: () => string;
    [key: string]: unknown;
  }

  export interface CKEditorProps {
    editor: unknown;
    data?: string;
    id?: string;
    config?: Record<string, unknown>;
    onReady?: (editor: EditorInstance) => void;
    onChange?: (event: unknown, editor: EditorInstance) => void;
    onBlur?: (event: unknown, editor: EditorInstance) => void;
    onFocus?: (event: unknown, editor: EditorInstance) => void;
    disabled?: boolean;
  }

  export const CKEditor: ComponentType<CKEditorProps>;
}

declare module '@ckeditor/ckeditor5-build-classic' {
  const ClassicEditor: unknown;
  export default ClassicEditor;
} 