# NexTools — Modular Desktop Utility

> A powerful, modular Windows utility suite built with Electron + React + Tailwind CSS. Features an authentic Windows 11 Mica glassmorphism UI.

## Features

| Module | Description |
|---|---|
| **Smart Sorter** | Auto-categorizes files by extension into folders. Live chokidar watcher mode. |
| **Bulk Renamer** | Batch rename with live Before→After preview table. Regex, prefix, suffix, numbering. |
| **File Converter** | Convert images (JPG/PNG/WEBP/AVIF/TIFF/BMP) with quality slider. PDF → Images, Images → PDF. |
| **Duplicate Finder** | MD5 checksum-based duplicate scanner with one-click deletion. |
| **System Dashboard** | Live CPU, RAM, Disk, Network gauges + detailed stats. |
| **Clipboard Manager** | Auto-tracks clipboard history. Pin, copy, search. |
| **Startup Manager** | View and toggle Windows startup programs via Registry. |
| **Archive Manager** | Create and extract ZIP archives with drag-and-drop. |
| **Network Scanner** | View network interfaces and ARP table devices. |
| **Text Tools** | Base64, URL encode/decode, Hash generator (MD5/SHA256/SHA512), JSON formatter. |
| **Font Preview** | Browse all installed system fonts with live preview text. |
| **Floating Widgets** | Focus Timer, Dropzone Shelf, Omni-Launcher (Alt+Space). |

## Running in Development

```bash
npm run electron:dev
```

## Building the .exe

```bash
npm run dist
```

The installer will be placed in the `release/` directory.

## Tech Stack

- **Electron** — Native Windows desktop shell
- **React** — Component-based UI
- **Tailwind CSS v4** — Utility-first styling
- **Vite** — Blazing-fast dev server and bundler
- **Node.js** — Backend file system, registry, and system access
- **jimp** — Pure-JS image processing (zero native binary deps)
- **pdf-lib** — Pure-JS PDF manipulation
- **chokidar** — File system watcher
- **systeminformation** — System metrics
- **archiver + unzipper** — Archive manipulation
