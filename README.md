# KBConvert - Image Processing Tool

KBConvert is a modern web application built with Next.js that provides powerful image processing capabilities. The application features a clean, responsive interface with dark/light mode support and offers two main tools:

## Features

### 1. Image Converter

- Convert images between multiple formats:
  - PNG
  - JPG
  - WEBP
  - ICO (Multi-size)
  - ICNS (Mac Icon)
- Adjust image dimensions
- Control output quality
- Preview images before conversion
- Drag and drop support

### 2. Image to Text (OCR)

- Extract text from images using Tesseract.js
- Support for multiple languages:
  - English
  - Macedonian (Cyrillic)
  - French
  - German
  - Spanish
  - Italian
- Real-time progress tracking
- Special optimization for Macedonian Cyrillic text
- Preview extracted text

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui Components
- Tesseract.js for OCR
- nuqs for URL State Management

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm, pnpm, yarn, bun

### Installation

```bash
# Clone the repository
git clone https://github.com/KikoBosh/kbconvert.git

# Install dependencies
npm install
```

### Running the Application

```bash
npm run dev
```

This will start the development server, and you can access the application at `http://localhost:3000`

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
