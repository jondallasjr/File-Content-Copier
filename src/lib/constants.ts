export const PREFERRED_EXTENSIONS = new Set([
    'js', 'jsx', 'ts', 'tsx',
    'py', 'rb', 'php',
    'json', 'yaml', 'yml',
    'md', 'txt',
    'css', 'scss', 'less',
    'html', 'htm',
    'sh', 'bash',
    'sql'
  ]);
  
export const BINARY_EXTENSIONS = new Set([
'pdf', 'doc', 'docx', 'xls', 'xlsx',
'png', 'jpg', 'jpeg', 'gif', 'ico', 'svg',
'mp3', 'mp4', 'wav', 'avi',
'zip', 'tar', 'gz', 'rar',
'exe', 'dll', 'so', 'dylib',
'ttf', 'otf', 'woff', 'woff2'
]);

export const QUICK_SELECT_PATTERNS = [
    {
      name: "Core Next.js Files",
      patterns: [
        "src/**/*",
        "package.json",
        "tsconfig.json",
        "next.config.*",
        "tailwind.config.*",
        "postcss.config.*",
        ".env*",
        ".eslintrc.*"
      ]
    },
    {
      name: "Config Files Only",
      patterns: [
        "package.json",
        "tsconfig.json",
        "next.config.*",
        "tailwind.config.*",
        "*.config.*",
        ".env*"
      ]
    },
    {
      name: "Source Files Only",
      patterns: ["src/**/*"]
    }
  ] satisfies Array<{
    name: string;
    patterns: string[];
  }>;