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