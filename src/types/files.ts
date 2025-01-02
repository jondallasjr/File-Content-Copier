export interface FileInfo {
  name: string;
  path: string;
  handle: FileSystemFileHandle;
  extension: string;
  size?: number;  // Optional since we're adding it to existing interface
  directory?: string;
}

  export interface Status {
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
  }
  
  export type ExtensionMap = Map<string, number>;

