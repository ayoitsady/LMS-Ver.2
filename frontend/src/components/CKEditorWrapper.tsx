'use client';

import React from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

// Define typed interfaces for CKEditor
interface EditorInstance {
  getData: () => string;
  [key: string]: unknown;
}

interface CKEditorConfig {
  toolbar?: string[];
  version?: string;
  [key: string]: unknown;
}

interface CKEditorWrapperProps {
  initialData?: string;
  onChange: (data: string) => void;
  config?: CKEditorConfig;
}

const CKEditorWrapper: React.FC<CKEditorWrapperProps> = ({ 
  initialData = '', 
  onChange, 
  config = {} 
}) => {
  // Default config with version
  const defaultConfig = {
    toolbar: [
      'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote', 'undo', 'redo'
    ],
    version: '42.0.0'
  };

  // Merge default config with provided config
  const editorConfig = { ...defaultConfig, ...config };

  return (
    <CKEditor
      editor={ClassicEditor}
      data={initialData}
      config={editorConfig}
      onReady={(editor: EditorInstance) => {
        // You can store the "editor" and use when it is needed.
        console.log('Editor is ready to use!', editor);
      }}
      onChange={(_event: unknown, editor: EditorInstance) => {
        const data = editor.getData();
        onChange(data);
      }}
    />
  );
};

export default CKEditorWrapper; 