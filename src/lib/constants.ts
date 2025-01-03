export const PREFERRED_EXTENSIONS = new Set([
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