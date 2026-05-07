const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('node:path')
const fs = require('node:fs')
const os = require('node:os')
const http = require('node:http')
const crypto = require('node:crypto')
const { exec, execSync } = require('node:child_process')
const util = require('node:util')
const execPromise = util.promisify(exec)

// ─── Performance & GPU cache fixes ───────────────────────────
// Disabling hardware acceleration eliminates all GPU disk cache
// errors ("Unable to move cache: Access is denied") and is safe
// for a utility desktop app that doesn't need GPU compositing.
app.disableHardwareAcceleration()
// Store app data in temp (NOT inside the project folder, which
// would trigger Vite's watcher and cause infinite HMR restarts)
app.setPath('userData', path.join(os.tmpdir(), 'nextools-electron'))


let mainWindow



// ─── Clipboard history (in-memory) ───────────────────────────
// ─── File extension → category mapping ───────────────────────
const SORT_MAP = {
  Images:      ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.tiff', '.tif', '.svg', '.heic'],
  Documents:   ['.pdf', '.doc', '.docx', '.txt', '.md', '.xlsx', '.xls', '.pptx', '.ppt', '.csv', '.odt'],
  Archives:    ['.zip', '.rar', '.7z', '.tar', '.gz', '.bz2', '.xz'],
  Executables: ['.exe', '.msi', '.apk', '.dmg', '.deb', '.rpm', '.bat', '.cmd'],
  Videos:      ['.mp4', '.mkv', '.avi', '.mov', '.wmv', '.flv', '.webm', '.m4v'],
  Audio:       ['.mp3', '.wav', '.flac', '.aac', '.ogg', '.m4a', '.wma', '.opus'],
  Code:        ['.js', '.ts', '.py', '.java', '.cpp', '.c', '.cs', '.go', '.rs', '.html', '.css', '.json'],
}


// ─── Create Main Window ───────────────────────────────────────
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100, height: 720,
    minWidth: 860, minHeight: 600,
    frame: false,
    transparent: false,
    backgroundColor: '#0a0a0e',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      webviewTag: true,  // Required for AnimeCenter Theatre
    }
  })

  const isDev = process.env.NODE_ENV === 'development'
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'))
  }
}



// ─── APP READY ────────────────────────────────────────────────
app.whenReady().then(() => {
  const isDev = process.env.NODE_ENV === 'development'

  // ── Folder Sorter ──────────────────────────────────────────
  ipcMain.handle('dialog:selectFolder', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({ properties: ['openDirectory'] })
    return canceled ? null : filePaths[0]
  })

  ipcMain.handle('dialog:selectFiles', async (event, extensions) => {
    const filters = extensions
      ? [{ name: 'Files', extensions: extensions.map(e => e.replace('.', '')) }]
      : [{ name: 'All Files', extensions: ['*'] }]
    const { canceled, filePaths } = await dialog.showOpenDialog({ properties: ['openFile', 'multiSelections'], filters })
    return canceled ? null : filePaths
  })

  ipcMain.handle('dialog:selectFilesAny', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile', 'multiSelections'],
      filters: [{ name: 'All Files', extensions: ['*'] }]
    })
    return canceled ? null : filePaths
  })

  ipcMain.handle('folder:sort', async (event, folderPath) => {
    try {
      const files = fs.readdirSync(folderPath)
      const logs = []
      for (const file of files) {
        const fullPath = path.join(folderPath, file)
        if (fs.statSync(fullPath).isDirectory()) continue
        const ext = path.extname(file).toLowerCase()
        let category = 'Others'
        for (const [cat, exts] of Object.entries(SORT_MAP)) {
          if (exts.includes(ext)) { category = cat; break }
        }
        const targetDir = path.join(folderPath, category)
        if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir)
        const target = path.join(targetDir, file)
        if (!fs.existsSync(target)) {
          fs.renameSync(fullPath, target)
          logs.push(`Moved: ${file} → ${category}/`)
        } else {
          logs.push(`Skipped: ${file} (already in ${category}/)`)
        }
      }
      return { success: true, logs }
    } catch (e) { return { success: false, error: e.message } }
  })

  
  // ── Bulk Renamer ───────────────────────────────────────────
  ipcMain.handle('folder:listFiles', async (event, folderPath) => {
    try {
      const files = fs.readdirSync(folderPath).filter(f => fs.statSync(path.join(folderPath, f)).isFile())
      return { success: true, files }
    } catch (e) { return { success: false, error: e.message } }
  })

  ipcMain.handle('folder:rename', async (event, folderPath, rules) => {
    try {
      const files = fs.readdirSync(folderPath).filter(f => fs.statSync(path.join(folderPath, f)).isFile())
      const logs = []
      let counter = 1
      for (const file of files) {
        const lastDot = file.lastIndexOf('.')
        const ext = lastDot > 0 ? file.slice(lastDot) : ''
        let base = lastDot > 0 ? file.slice(0, lastDot) : file
        if (rules.stripSpaces) base = base.replace(/\s+/g, '')
        if (rules.stripUnderscores) base = base.replace(/_/g, '')
        if (rules.toLowerCase) base = base.toLowerCase()
        if (rules.toUpperCase) base = base.toUpperCase()
        if (rules.findStr) {
          try {
            if (rules.useRegex) base = base.replace(new RegExp(rules.findStr, 'g'), rules.replaceStr || '')
            else base = base.split(rules.findStr).join(rules.replaceStr || '')
          } catch {}
        }
        if (rules.prefix) base = rules.prefix + base
        if (rules.suffix) base = base + rules.suffix
        if (rules.sequential) { base = base + '_' + String(counter).padStart(3, '0'); counter++ }
        const newName = base + ext
        if (newName !== file) {
          const src = path.join(folderPath, file)
          const dst = path.join(folderPath, newName)
          if (!fs.existsSync(dst)) { fs.renameSync(src, dst); logs.push(`${file} → ${newName}`) }
          else logs.push(`Skipped: ${newName} (exists)`)
        }
      }
      return { success: true, logs }
    } catch (e) { return { success: false, error: e.message } }
  })

  // ── File Converter ─────────────────────────────────────────
  // Jimp 0.22.x MIME types
  const JIMP_MIME = {
    jpg:  'image/jpeg', jpeg: 'image/jpeg',
    png:  'image/png',  bmp:  'image/bmp',
    tiff: 'image/tiff', tif:  'image/tiff',
    gif:  'image/gif',
  }

  ipcMain.handle('convert:image', async (event, { input, format, quality, outputDir, resize }) => {
    try {
      const Jimp = require('jimp')
      const img = await Jimp.read(input)

      if (resize && (resize.width || resize.height)) {
        const w = parseInt(resize.width) || Jimp.AUTO
        const h = parseInt(resize.height) || Jimp.AUTO
        img.resize(w, h)
      }

      const ext = format === 'jpeg' ? 'jpg' : format
      const baseName = path.basename(input, path.extname(input))
      const outDir = outputDir || path.dirname(input)
      const output = path.join(outDir, `${baseName}_converted.${ext}`)

      const mime = JIMP_MIME[format] || JIMP_MIME[ext]
      if (!mime) return { success: false, error: `Unsupported format: ${format}` }

      // Apply quality only for jpeg
      if (mime === 'image/jpeg') img.quality(parseInt(quality) || 90)

      const buf = await img.getBufferAsync(mime)
      fs.writeFileSync(output, buf)
      return { success: true, output }
    } catch (e) { return { success: false, error: e.message } }
  })

  ipcMain.handle('convert:pdf', async (event, { input, action, outputDir }) => {
    try {
      const { PDFDocument } = require('pdf-lib')
      const outDir = outputDir || path.dirname(input)

      if (action === 'merge') {
        // input here is array of image paths, merge into PDF
        const pdfDoc = await PDFDocument.create()
        const Jimp = require('jimp')
        const inputs = Array.isArray(input) ? input : [input]
        for (const imgPath of inputs) {
          const img = await Jimp.read(imgPath)
          const jpgBuf = await img.getBufferAsync(Jimp.MIME_JPEG)
          const jpgEmbed = await pdfDoc.embedJpg(jpgBuf)
          const page = pdfDoc.addPage([jpgEmbed.width, jpgEmbed.height])
          page.drawImage(jpgEmbed, { x: 0, y: 0, width: jpgEmbed.width, height: jpgEmbed.height })
        }
        const output = path.join(outDir, 'merged.pdf')
        fs.writeFileSync(output, await pdfDoc.save())
        return { success: true, output }
      }

      if (action === 'toImages') {
        // Extract PDF pages to PNG using pdf-lib + canvas
        const pdfBytes = fs.readFileSync(input)
        const pdfDoc = await PDFDocument.load(pdfBytes)
        const pageCount = pdfDoc.getPageCount()
        const baseName = path.basename(input, '.pdf')
        const outputs = []
        // Export page info (we can't render without a renderer in Node.js without heavy deps)
        // So we'll return metadata and inform user to open in browser
        return {
          success: true,
          output: outDir,
          message: `PDF has ${pageCount} pages. Full rasterization requires Ghostscript. Opening PDF info...`,
          pageCount
        }
      }

      return { success: false, error: 'Unknown action' }
    } catch (e) { return { success: false, error: e.message } }
  })

  // ── Duplicate Finder ───────────────────────────────────────
  ipcMain.handle('files:findDuplicates', async (event, folderPath) => {
    try {
      const walk = (dir) => {
        let results = []
        for (const f of fs.readdirSync(dir)) {
          const full = path.join(dir, f)
          if (fs.statSync(full).isDirectory()) results = results.concat(walk(full))
          else results.push(full)
        }
        return results
      }
      const allFiles = walk(folderPath)
      const hashMap = {}
      for (const file of allFiles) {
        const buf = fs.readFileSync(file)
        const hash = crypto.createHash('md5').update(buf).digest('hex')
        const size = fs.statSync(file).size
        if (!hashMap[hash]) hashMap[hash] = { hash, size, files: [] }
        hashMap[hash].files.push(file)
      }
      const groups = Object.values(hashMap).filter(g => g.files.length > 1)
      return { success: true, groups }
    } catch (e) { return { success: false, error: e.message } }
  })

  ipcMain.handle('files:delete', async (event, filepath) => {
    try { fs.unlinkSync(filepath); return { success: true } }
    catch (e) { return { success: false, error: e.message } }
  })

  // ── System Stats ───────────────────────────────────────────
  
  // ── Clipboard ──────────────────────────────────────────────
  
  
  // ── Text Tools / Hash ──────────────────────────────────────
  ipcMain.handle('text:generateHashes', async (event, input) => {
    try {
      const hashes = {
        MD5: crypto.createHash('md5').update(input).digest('hex'),
        SHA1: crypto.createHash('sha1').update(input).digest('hex'),
        SHA256: crypto.createHash('sha256').update(input).digest('hex'),
        SHA512: crypto.createHash('sha512').update(input).digest('hex'),
      }
      return { success: true, hashes }
    } catch (e) { return { success: false, error: e.message } }
  })



  // ── Network Scanner ────────────────────────────────────────
  ipcMain.handle('network:scan', async () => {
    try {
      const si = require('systeminformation')
      const interfaces = await si.networkInterfaces()
      const devices = []
      try {
        const { stdout } = await execPromise('arp -a', { timeout: 5000 })
        const lines = stdout.split('\n')
        for (const line of lines) {
          const match = line.match(/(\d+\.\d+\.\d+\.\d+)\s+([\da-f-]+)\s+(\w+)/i)
          if (match) devices.push({ ip: match[1], mac: match[2].replace(/-/g, ':'), type: match[3] })
        }
      } catch {}
      return { success: true, interfaces, devices }
    } catch (e) { return { success: false, error: e.message } }
  })


  // ── Local WiFi File Sender ───────────────────────────────────
  function getLocalIP() {
    const ifaces = os.networkInterfaces()
    for (const name of Object.keys(ifaces)) {
      for (const iface of ifaces[name]) {
        if (iface.family === 'IPv4' && !iface.internal) return iface.address
      }
    }
    return '127.0.0.1'
  }

  function buildServerHTML(ip, port) {
    const fileRows = sharedFiles.map(f => `
      <tr>
        <td><a href="/download/${encodeURIComponent(f.name)}" style="color:#818cf8">${f.name}</a></td>
        <td style="color:#6b7280">${(f.size/1024/1024).toFixed(2)} MB</td>
        <td><a href="/download/${encodeURIComponent(f.name)}" style="color:#34d399;text-decoration:none">⬇ Download</a></td>
      </tr>`).join('')
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
    <title>NexTools - File Sender</title>
    <style>*{box-sizing:border-box;margin:0;padding:0}body{background:#0a0a0f;font-family:Inter,sans-serif;color:#e2e8f0;min-height:100vh;display:flex;flex-direction:column;align-items:center;padding:40px 20px}
    h1{font-size:28px;font-weight:700;margin-bottom:4px;background:linear-gradient(135deg,#818cf8,#c084fc);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
    .badge{background:rgba(99,102,241,.15);border:1px solid rgba(99,102,241,.3);color:#818cf8;padding:4px 12px;border-radius:999px;font-size:12px;margin-bottom:40px}
    .card{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:28px;width:100%;max-width:640px;margin-bottom:20px}
    h2{font-size:14px;font-weight:600;color:rgba(255,255,255,.5);text-transform:uppercase;letter-spacing:.08em;margin-bottom:16px}
    form{display:flex;gap:12px;flex-wrap:wrap}input[type=file]{flex:1;background:rgba(0,0,0,.4);border:1px solid rgba(255,255,255,.1);border-radius:10px;padding:10px;color:#94a3b8;font-size:13px}
    button{background:linear-gradient(135deg,rgba(99,102,241,.8),rgba(168,85,247,.7));color:#fff;border:none;border-radius:10px;padding:10px 24px;font-size:13px;font-weight:600;cursor:pointer}
    table{width:100%;border-collapse:collapse}td{padding:12px 8px;border-bottom:1px solid rgba(255,255,255,.05);font-size:13px}
    .empty{color:rgba(255,255,255,.2);text-align:center;padding:24px}</style></head>
    <body><h1>NexTools File Sender</h1><p class="badge">${ip}:${port}</p>
    <div class="card"><h2>Upload File</h2><form method="POST" action="/upload" enctype="multipart/form-data">
    <input type="file" name="file" multiple><button type="submit">Upload</button></form></div>
    <div class="card"><h2>Shared Files (${sharedFiles.length})</h2>
    ${sharedFiles.length===0?'<p class="empty">No files shared yet. Upload from this page or the app.</p>':
    '<table>'+fileRows+'</table>'}</div></body></html>`
  }

  function startHTTPServer(shareDir) {
    const port = fileServerPort || 0
    fileServer = http.createServer((req, res) => {
      const url = new URL(req.url, `http://localhost`)
      const ip = getLocalIP()

      if (req.method === 'GET' && url.pathname === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html;charset=utf-8' })
        return res.end(buildServerHTML(ip, fileServerPort))
      }

      if (req.method === 'GET' && url.pathname === '/files') {
        res.writeHead(200, { 'Content-Type': 'application/json' })
        return res.end(JSON.stringify(sharedFiles.map(f => ({ name: f.name, size: f.size }))))
      }

      if (req.method === 'GET' && url.pathname.startsWith('/download/')) {
        const name = decodeURIComponent(url.pathname.slice(10))
        const f = sharedFiles.find(f => f.name === name)
        if (!f || !fs.existsSync(f.path)) { res.writeHead(404); return res.end('Not found') }
        res.writeHead(200, { 'Content-Disposition': `attachment; filename="${name}"`, 'Content-Type': 'application/octet-stream' })
        return fs.createReadStream(f.path).pipe(res)
      }

      if (req.method === 'POST' && url.pathname === '/upload') {
        let body = Buffer.alloc(0)
        req.on('data', chunk => { body = Buffer.concat([body, chunk]) })
        req.on('end', () => {
          // Simple multipart parser for single file
          const contentType = req.headers['content-type'] || ''
          const boundaryMatch = contentType.match(/boundary=(.+)$/)
          if (!boundaryMatch) { res.writeHead(400); return res.end('No boundary') }
          const boundary = Buffer.from('--' + boundaryMatch[1])
          const parts = body.toString('binary').split(boundary.toString('binary'))
          for (const part of parts) {
            const nameMatch = part.match(/name="file".*?filename="([^"]+)"/s)
            if (nameMatch) {
              const fname = nameMatch[1]
              const dataStart = part.indexOf('\r\n\r\n') + 4
              const dataEnd = part.lastIndexOf('\r\n')
              const fileData = Buffer.from(part.slice(dataStart, dataEnd), 'binary')
              const savePath = path.join(shareDir, fname)
              fs.writeFileSync(savePath, fileData)
              if (!sharedFiles.find(f => f.name === fname)) {
                sharedFiles.push({ name: fname, size: fileData.length, path: savePath, uploadTime: Date.now() })
              }
              if (mainWindow) mainWindow.webContents.send('fileserver:newfile', { name: fname, size: fileData.length })
            }
          }
          res.writeHead(302, { Location: '/' })
          res.end()
        })
        return
      }

      res.writeHead(404)
      res.end('Not found')
    })

    fileServer.listen(0, '0.0.0.0', () => {
      fileServerPort = fileServer.address().port
    })
  }

  ipcMain.handle('fileserver:start', async (event, shareDir) => {
    try {
      if (fileServer) { fileServer.close(); fileServer = null }
      sharedFiles = []
      startHTTPServer(shareDir)
      await new Promise(r => setTimeout(r, 300))
      const ip = getLocalIP()
      return { success: true, ip, port: fileServerPort, url: `http://${ip}:${fileServerPort}` }
    } catch (e) { return { success: false, error: e.message } }
  })

  ipcMain.handle('fileserver:stop', async () => {
    if (fileServer) { fileServer.close(); fileServer = null; fileServerPort = 0; sharedFiles = [] }
    return { success: true }
  })

  ipcMain.handle('fileserver:addFile', async (event, filePath) => {
    try {
      const name = path.basename(filePath)
      const size = fs.statSync(filePath).size
      if (!sharedFiles.find(f => f.name === name)) {
        sharedFiles.push({ name, size, path: filePath, uploadTime: Date.now() })
      }
      return { success: true, files: sharedFiles.map(f => ({ name: f.name, size: f.size })) }
    } catch (e) { return { success: false, error: e.message } }
  })

  ipcMain.handle('fileserver:removeFile', async (event, name) => {
    sharedFiles = sharedFiles.filter(f => f.name !== name)
    return { success: true, files: sharedFiles.map(f => ({ name: f.name, size: f.size })) }
  })

  ipcMain.handle('fileserver:getStatus', async () => {
    const ip = getLocalIP()
    return { success: true, running: !!fileServer, ip, port: fileServerPort, files: sharedFiles.map(f => ({ name: f.name, size: f.size })) }
  })


  // ── Screenshot ───────────────────────────────────────────
  ipcMain.handle('screenshot:take', async (event, { outputDir }) => {
    try {
      const outDir = outputDir || path.join(os.homedir(), 'Desktop')
      const fname = `screenshot_${Date.now()}.png`
      const output = path.join(outDir, fname)
      const ps = `
        Add-Type -AssemblyName System.Windows.Forms
        Add-Type -AssemblyName System.Drawing
        $screen = [System.Windows.Forms.Screen]::PrimaryScreen
        $bmp = New-Object System.Drawing.Bitmap($screen.Bounds.Width, $screen.Bounds.Height)
        $g = [System.Drawing.Graphics]::FromImage($bmp)
        $g.CopyFromScreen($screen.Bounds.Location, [System.Drawing.Point]::Empty, $screen.Bounds.Size)
        $bmp.Save('${output.replace(/\\/g, '/')}')
        $g.Dispose(); $bmp.Dispose()
      `.trim()
      await execPromise(`powershell -Command "${ps.replace(/\n\s*/g, '; ')}"`, { timeout: 15000 })
      return { success: true, path: output }
    } catch (e) { return { success: false, error: e.message } }
  })

  // ── Disk Folder Scanner ─────────────────────────────────────
  ipcMain.handle('disk:folderUsage', async (event, folderPath) => {
    try {
      const items = []
      const entries = fs.readdirSync(folderPath, { withFileTypes: true })
      for (const entry of entries) {
        const fullPath = path.join(folderPath, entry.name)
        try {
          if (entry.isDirectory()) {
            // Recursive size using powershell for speed
            let size = 0
            try {
              const { stdout } = await execPromise(
                `powershell -Command "(Get-ChildItem '${fullPath.replace(/'/g, "''")}' -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum"`,
                { timeout: 8000 }
              )
              size = parseInt(stdout.trim()) || 0
            } catch {}
            items.push({ name: entry.name, size, isDir: true })
          } else {
            const size = fs.statSync(fullPath).size
            items.push({ name: entry.name, size, isDir: false })
          }
        } catch {}
      }
      items.sort((a, b) => b.size - a.size)
      return { success: true, items: items.slice(0, 30) }
    } catch (e) { return { success: false, error: e.message } }
  })

  // ── System Info Report ────────────────────────────────────────
  ipcMain.handle('system:fullReport', async () => {
    try {
      const si = require('systeminformation')
      const [cpu, cpuLoad, mem, disk, net, osInfo, graphics, battery] = await Promise.all([
        si.cpu(), si.currentLoad(), si.mem(), si.fsSize(),
        si.networkInterfaces(), si.osInfo(), si.graphics(), si.battery()
      ])

      const fmtB = (b) => {
        if (!b) return '0 B'
        if (b < 1024) return b + ' B'
        if (b < 1024 ** 2) return (b / 1024).toFixed(1) + ' KB'
        if (b < 1024 ** 3) return (b / 1024 ** 2).toFixed(1) + ' MB'
        return (b / 1024 ** 3).toFixed(2) + ' GB'
      }

      const sep = (title) => `\n${'═'.repeat(60)}\n  ${title}\n${'═'.repeat(60)}`
      const line = '─'.repeat(60)

      let report = `NexTools System Report\nGenerated: ${new Date().toLocaleString()}\n${line}\n`

      report += sep('OPERATING SYSTEM')
      report += `\n  Platform    : ${osInfo.platform}`
      report += `\n  OS          : ${osInfo.distro} ${osInfo.release}`
      report += `\n  Architecture: ${osInfo.arch}`
      report += `\n  Kernel      : ${osInfo.kernel}`
      report += `\n  Hostname    : ${osInfo.hostname}`

      report += sep('PROCESSOR (CPU)')
      report += `\n  Model       : ${cpu.manufacturer} ${cpu.brand}`
      report += `\n  Speed       : ${cpu.speed} GHz (max ${cpu.speedMax} GHz)`
      report += `\n  Physical    : ${cpu.physicalCores} cores`
      report += `\n  Logical     : ${cpu.cores} threads`
      report += `\n  Current Load: ${cpuLoad.currentLoad.toFixed(1)}%`

      report += sep('MEMORY (RAM)')
      report += `\n  Total       : ${fmtB(mem.total)}`
      report += `\n  Used        : ${fmtB(mem.used)}`
      report += `\n  Free        : ${fmtB(mem.free)}`
      report += `\n  Usage       : ${((mem.used / mem.total) * 100).toFixed(1)}%`

      report += sep('STORAGE')
      for (const d of disk.filter(d => d.size > 0)) {
        report += `\n  Drive: ${d.fs} (${d.type})`
        report += `\n    Total : ${fmtB(d.size)}`
        report += `\n    Used  : ${fmtB(d.used)}`
        report += `\n    Free  : ${fmtB(d.available)}`
        report += `\n    Usage : ${((d.used / d.size) * 100).toFixed(1)}%\n`
      }

      report += sep('NETWORK INTERFACES')
      for (const iface of net.filter(i => i.ip4)) {
        report += `\n  ${iface.iface} (${iface.type})`
        report += `\n    IPv4 : ${iface.ip4 || '—'}`
        report += `\n    IPv6 : ${iface.ip6 || '—'}`
        report += `\n    MAC  : ${iface.mac || '—'}`
        report += `\n    Speed: ${iface.speed ? iface.speed + ' Mbps' : '—'}\n`
      }

      if (graphics.controllers?.length) {
        report += sep('GRAPHICS')
        for (const g of graphics.controllers) {
          report += `\n  ${g.vendor} ${g.model}`
          report += `\n    VRAM: ${fmtB((g.vram || 0) * 1024 * 1024)}`
        }
      }

      if (battery.hasBattery) {
        report += sep('BATTERY')
        report += `\n  Level    : ${battery.percent}%`
        report += `\n  Charging : ${battery.isCharging ? 'Yes' : 'No'}`
        report += `\n  Status   : ${battery.acConnected ? 'AC Connected' : 'On Battery'}`
      }

      report += `\n\n${line}\nEnd of Report\n`

      return { success: true, report }
    } catch (e) { return { success: false, error: e.message } }
  })

  ipcMain.handle('system:saveReport', async (event, report) => {
    try {
      const { filePath } = await dialog.showSaveDialog(mainWindow, {
        title: 'Save System Report',
        defaultPath: path.join(os.homedir(), 'Desktop', `system_report_${Date.now()}.txt`),
        filters: [{ name: 'Text File', extensions: ['txt'] }]
      })
      if (!filePath) return { success: false, error: 'Cancelled' }
      fs.writeFileSync(filePath, report, 'utf8')
      return { success: true, path: filePath }
    } catch (e) { return { success: false, error: e.message } }
  })

  // ── PDF helpers for renderer-side rendering ─────────────────
  ipcMain.handle('fs:readBase64', async (event, filePath) => {
    try {
      const buf = fs.readFileSync(filePath)
      return { success: true, data: buf.toString('base64') }
    } catch (e) { return { success: false, error: e.message } }
  })

  ipcMain.handle('fs:saveBase64', async (event, { base64, outputPath }) => {
    try {
      const buf = Buffer.from(base64, 'base64')
      fs.writeFileSync(outputPath, buf)
      return { success: true, path: outputPath }
    } catch (e) { return { success: false, error: e.message } }
  })

  ipcMain.handle('fs:fileSize', async (event, filePath) => {
    try { return fs.statSync(filePath).size } catch { return 0 }
  })

  // ── Images → PDF (pdf-lib) ──────────────────────────────────
  ipcMain.handle('pdf:fromImages', async (event, { files, outputDir }) => {
    try {
      const { PDFDocument } = require('pdf-lib')
      const Jimp = require('jimp')
      const pdf = await PDFDocument.create()
      for (const imgPath of files) {
        const ext = imgPath.split('.').pop().toLowerCase()
        const img = await Jimp.read(imgPath)
        const jpgBuf = await img.getBufferAsync('image/jpeg')
        const embedded = await pdf.embedJpg(jpgBuf)
        const page = pdf.addPage([embedded.width, embedded.height])
        page.drawImage(embedded, { x:0, y:0, width: embedded.width, height: embedded.height })
      }
      const baseName = `merged_${Date.now()}.pdf`
      const output = path.join(outputDir, baseName)
      fs.writeFileSync(output, await pdf.save())
      return { success: true, output }
    } catch (e) { return { success: false, error: e.message } }
  })

  // ── PDF Split (each page → separate PDF) ───────────────────
  ipcMain.handle('pdf:split', async (event, { input, outputDir }) => {
    try {
      const { PDFDocument } = require('pdf-lib')
      const srcBytes = fs.readFileSync(input)
      const srcPdf = await PDFDocument.load(srcBytes)
      const total = srcPdf.getPageCount()
      const outDir = outputDir || path.dirname(input)
      const baseName = path.basename(input, '.pdf')
      const files = []
      for (let i = 0; i < total; i++) {
        const newDoc = await PDFDocument.create()
        const [page] = await newDoc.copyPages(srcPdf, [i])
        newDoc.addPage(page)
        const outPath = path.join(outDir, `${baseName}_page_${String(i+1).padStart(3,'0')}.pdf`)
        fs.writeFileSync(outPath, await newDoc.save())
        files.push(outPath)
      }
      return { success: true, files }
    } catch (e) { return { success: false, error: e.message } }
  })

  // ── File Shredder ──────────────────────────────────────────
  ipcMain.handle('files:shred', async (event, filePath, passes = 3) => {
    try {
      const size = fs.statSync(filePath).size
      for (let p = 0; p < passes; p++) {
        const buf = crypto.randomBytes(size)
        fs.writeFileSync(filePath, buf)
      }
      fs.unlinkSync(filePath)
      return { success: true }
    } catch (e) { return { success: false, error: e.message } }
  })

  // ── Wake-on-LAN ─────────────────────────────────────────
  ipcMain.handle('network:wol', async (event, mac) => {
    try {
      const dgram = require('node:dgram')
      const cleaned = mac.replace(/[^0-9a-fA-F]/g, '')
      if (cleaned.length !== 12) return { success: false, error: 'Invalid MAC (need 12 hex digits)' }
      const magic = Buffer.alloc(102)
      magic.fill(0xff, 0, 6)
      for (let i = 0; i < 16; i++)
        for (let j = 0; j < 6; j++)
          magic[6 + i*6 + j] = parseInt(cleaned.slice(j*2, j*2+2), 16)
      return new Promise(resolve => {
        const socket = dgram.createSocket('udp4')
        socket.once('listening', () => socket.setBroadcast(true))
        socket.send(magic, 0, magic.length, 9, '255.255.255.255', err => {
          socket.close()
          resolve(err ? { success: false, error: err.message } : { success: true })
        })
      })
    } catch (e) { return { success: false, error: e.message } }
  })

  // ── Port Scanner ───────────────────────────────────────────
  function tryPort(host, port) {
    return new Promise(resolve => {
      const { createConnection } = require('node:net')
      const s = createConnection({ host, port, timeout: 800 })
      s.on('connect', () => { s.destroy(); resolve(true) })
      s.on('timeout', () => { s.destroy(); resolve(false) })
      s.on('error', () => { s.destroy(); resolve(false) })
    })
  }

  ipcMain.handle('network:scanPorts', async (event, { host, ports }) => {
    try {
      const results = await Promise.all(ports.map(p => tryPort(host, p).then(open => open ? p : null)))
      return { success: true, openPorts: results.filter(Boolean) }
    } catch (e) { return { success: false, error: e.message } }
  })

  ipcMain.handle('network:scanPortRange', async (event, { host, start, end }) => {
    try {
      const total = Math.min(end - start + 1, 1024)
      const ports = Array.from({ length: total }, (_, i) => start + i)
      // Batch in groups of 100 to avoid socket exhaustion
      const openPorts = []
      for (let i = 0; i < ports.length; i += 100) {
        const batch = ports.slice(i, i + 100)
        const res = await Promise.all(batch.map(p => tryPort(host, p).then(open => open ? p : null)))
        openPorts.push(...res.filter(Boolean))
      }
      return { success: true, openPorts: openPorts.sort((a, b) => a - b) }
    } catch (e) { return { success: false, error: e.message } }
  })






  // ── Wallpaper Dominant Color (Windows registry → file → jimp) ─
  ipcMain.handle('wallpaper:getDominantColor', async () => {
    try {
      const { execSync } = require('node:child_process')
      // Read wallpaper path from Windows registry
      const regOut = execSync(
        'reg query "HKCU\\Control Panel\\Desktop" /v Wallpaper',
        { encoding: 'utf8', timeout: 3000 }
      )
      const match = regOut.match(/Wallpaper\s+REG_SZ\s+(.+)/)
      if (!match) return null
      const wpPath = match[1].trim()
      if (!fs.existsSync(wpPath)) return null
      // Sample 16×16 pixel grid via raw BMP (no jimp needed)
      const buf = fs.readFileSync(wpPath)
      // Simple BMP pixel sampler — works for 24/32-bit BMP wallpapers
      // For PNG/JPG fall back to a neutral colour
      const sig = buf.slice(0,2).toString('ascii')
      if (sig !== 'BM') return '#1a1a2e'  // default for non-BMP
      const pixelOffset = buf.readUInt32LE(10)
      const w = buf.readInt32LE(18), h = Math.abs(buf.readInt32LE(22))
      const bpp = buf.readUInt16LE(28)
      if (bpp < 24) return '#1a1a2e'
      const step = Math.max(1, Math.floor(w / 8))
      let r=0,g=0,b=0,cnt=0
      for (let x=0; x<w; x+=step) {
        const rowByte = pixelOffset + (h-1) * w * (bpp/8) + x * (bpp/8)
        if (rowByte + 3 > buf.length) continue
        b += buf[rowByte]; g += buf[rowByte+1]; r += buf[rowByte+2]; cnt++
      }
      if (!cnt) return '#1a1a2e'
      const hex = c => Math.round(c/cnt).toString(16).padStart(2,'0')
      // Desaturate for a subtle glow (move toward dark)
      const ri = Math.round(r/cnt * 0.35), gi = Math.round(g/cnt * 0.35), bi = Math.round(b/cnt * 0.35)
      return `#${ri.toString(16).padStart(2,'0')}${gi.toString(16).padStart(2,'0')}${bi.toString(16).padStart(2,'0')}`
    } catch { return '#1a1a2e' }
  })



  // ── Window Controls ────────────────────────────────────────
  ipcMain.on('window:close', () => mainWindow?.close())
  ipcMain.on('window:minimize', () => mainWindow?.minimize())
  ipcMain.on('window:maximize', () => { if (mainWindow?.isMaximized()) mainWindow.unmaximize(); else mainWindow?.maximize() })
  ipcMain.on('window:fullscreen', () => mainWindow?.setFullScreen(!mainWindow.isFullScreen()))

  // ── Init ───────────────────────────────────────────────────
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() })
