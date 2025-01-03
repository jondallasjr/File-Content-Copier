export const TEXT_FILE_EXTENSIONS = new Set([
    // Web/Config
    'js', 'jsx', 'ts', 'tsx', 'json', 'yml', 'yaml', 'toml', 'xml', 'html', 'css', 'scss', 'less',
    // Config files
    'env', 'ini', 'conf', 'config',
    // Documentation
    'md', 'mdx', 'txt', 'rst',
    // Programming Languages
    'py', 'rb', 'php', 'java', 'c', 'cpp', 'h', 'hpp', 'cs', 'go', 'rs', 'swift',
    'kt', 'scala', 'perl', 'r', 'sql', 'sh', 'bash', 'zsh', 'fish',
    // Common Config Files (without extension)
    'dockerfile', 'makefile', 'gitignore', 'dockerignore', 'editorconfig'
  ]);
  
  // Group extensions by category for the dropdown
  export const EXTENSION_CATEGORIES = [
    {
      name: 'Web Development',
      extensions: ['js', 'jsx', 'ts', 'tsx', 'html', 'css', 'scss', 'less']
    },
    {
      name: 'Configuration',
      extensions: ['json', 'yml', 'yaml', 'toml', 'env', 'ini', 'conf', 'config']
    },
    {
      name: 'Documentation',
      extensions: ['md', 'mdx', 'txt', 'rst']
    },
    {
      name: 'Programming',
      extensions: ['py', 'rb', 'php', 'java', 'c', 'cpp', 'cs', 'go', 'rs', 'swift']
    }
  ] as const;
  
  // Default selected categories
  export const DEFAULT_SELECTED_CATEGORIES = ['Web Development', 'Configuration'];