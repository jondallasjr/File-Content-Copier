export interface FileInfo {
  name: string;
  path: string;
  handle: FileSystemFileHandle;
  extension: string;
  size?: number;
  directory?: string;
  isSelectable: boolean;
  isTextFile: boolean; 
}

export interface Status {
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export type ExtensionMap = Map<string, number>;

