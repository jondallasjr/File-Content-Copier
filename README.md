# File Content Copier

A secure, client-side tool for copying the contents of multiple text files to your clipboard. Perfect for sharing code with AI assistants or documenting project structures.

## Features

- 🔒 Fully client-side processing - no data leaves your browser
- 📁 Browse and select files from any directory
- 🔍 Search and filter files by extension
- ⚡ Quick selection tools and keyboard shortcuts
- 📝 Support for all text file formats
- 🛡️ Automatic binary file detection and exclusion
- 🎯 File size limit (5MB) to ensure stable performance
- 🔐 No data collection or tracking

## Privacy & Security

- All file processing happens locally in your browser
- No data is uploaded to any servers
- Files are accessed using the secure File System Access API
- Only text files are processed; binary files are automatically excluded
- Clipboard operations are handled securely through the system clipboard API

## Getting Started

1. Clone the repository:
```bash
git clone [repository-url]
cd file-content-copier
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser

## Usage

1. Click "Select Folder" to choose your project directory
2. Navigate the directory tree to select files
3. Use search and filters to find specific files
4. Click "Copy Selected" to copy file contents to clipboard

### Keyboard Shortcuts

- `Ctrl/Cmd + A`: Select all files
- `Ctrl/Cmd + C`: Copy selected files
- `Esc`: Clear selection/search

## Technical Details

- Built with Next.js and React
- Uses the File System Access API for secure file handling
- Implements efficient text file detection
- Responsive design with Tailwind CSS
- TypeScript for type safety

## License

[Add your license here]