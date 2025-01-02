
// Known binary file extensions
const KNOWN_BINARY_EXTENSIONS = new Set([
    // Images
    'jpg', 'jpeg', 'png', 'gif', 'bmp', 'ico', 'webp', 'tiff', 'svg',
    // Audio/Video
    'mp3', 'wav', 'ogg', 'mp4', 'avi', 'mov', 'wmv', 'flv', 'webm',
    // Archives
    'zip', 'rar', '7z', 'tar', 'gz', 'bz2',
    // Executables
    'exe', 'dll', 'so', 'dylib', 'bin',
    // Documents
    'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
    // Fonts
    'ttf', 'otf', 'woff', 'woff2',
    // Other
    'db', 'sqlite', 'pyc'
  ]);
  
  // Cache of file paths that we've already checked
  const textFileCache = new Map<string, boolean>();
  
  export async function isTextFile(handle: FileSystemFileHandle): Promise<boolean> {
    // Check cache first
    if (textFileCache.has(handle.name)) {
      return textFileCache.get(handle.name)!;
    }
  
    // Check extension first
    const extension = handle.name.split('.').pop()?.toLowerCase() || '';
    if (KNOWN_BINARY_EXTENSIONS.has(extension)) {
      textFileCache.set(handle.name, false);
      return false;
    }
  
    try {
      const file = await handle.getFile();
      
      // Check file size
      if (file.size === 0) {
        textFileCache.set(handle.name, true);
        return true;
      }
  
      // Read first 4KB of the file
      const sampleSize = Math.min(4096, file.size);
      const buffer = await file.slice(0, sampleSize).arrayBuffer();
      const bytes = new Uint8Array(buffer);
      
      // Check if file content appears to be text
      // This checks if the content is primarily printable ASCII or valid UTF-8
      let textCount = 0;
      let binaryCount = 0;
  
      for (let i = 0; i < bytes.length; i++) {
        const byte = bytes[i];
        // Count printable ASCII characters and common control characters
        if ((byte >= 32 && byte <= 126) || // Printable ASCII
            byte === 9 || // Tab
            byte === 10 || // Line feed
            byte === 13) { // Carriage return
          textCount++;
        } else {
          binaryCount++;
        }
      }
  
      // If more than 90% of content appears to be text, consider it a text file
      const isText = (textCount / (textCount + binaryCount)) > 0.9;
      textFileCache.set(handle.name, isText);
      return isText;
  
    } catch (error) {
      console.error(`Error checking if ${handle.name} is text:`, error);
      textFileCache.set(handle.name, false);
      return false;
    }
  }
  
  export function clearTextFileCache() {
    textFileCache.clear();
  }
  
  // Format file content for copying
  export function formatFileContent(path: string, content: string): string {
    return `=== START ${path} ===\n${content}\n=== END ${path} ===\n\n`;
  }