const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  // Dialogs
  selectFolder:     ()           => ipcRenderer.invoke('dialog:selectFolder'),
  selectFiles:      (exts)       => ipcRenderer.invoke('dialog:selectFiles', exts),
  selectFilesAny:   ()           => ipcRenderer.invoke('dialog:selectFilesAny'),

  // Smart Sorter
  sortFolder:       (dir)        => ipcRenderer.invoke('folder:sort', dir),
  startWatcher:     (dir)        => ipcRenderer.invoke('folder:startWatcher', dir),
  stopWatcher:      ()           => ipcRenderer.invoke('folder:stopWatcher'),

  // Bulk Renamer
  listFiles:        (dir)        => ipcRenderer.invoke('folder:listFiles', dir),
  renameFiles:      (dir, rules) => ipcRenderer.invoke('folder:rename', dir, rules),

  // File Converter + PDF
  convertImage:     (opts)       => ipcRenderer.invoke('convert:image', opts),
  imagesToPdf:      (opts)       => ipcRenderer.invoke('pdf:fromImages', opts),
  splitPdf:         (opts)       => ipcRenderer.invoke('pdf:split', opts),
  readFileBase64:   (p)          => ipcRenderer.invoke('fs:readBase64', p),
  saveBase64File:   (opts)       => ipcRenderer.invoke('fs:saveBase64', opts),
  getFileSize:      (p)          => ipcRenderer.invoke('fs:fileSize', p),

  // Duplicate Finder
  findDuplicates:   (dir)        => ipcRenderer.invoke('files:findDuplicates', dir),
  deleteFile:       (path)       => ipcRenderer.invoke('files:delete', path),

  // System Dashboard
  getSystemStats:   ()           => ipcRenderer.invoke('system:stats'),

  // Clipboard
  getClipboardHistory: ()        => ipcRenderer.invoke('clipboard:getHistory'),
  writeClipboard:   (text)       => ipcRenderer.invoke('clipboard:write', text),

  // Text Tools
  generateHashes:   (input)      => ipcRenderer.invoke('text:generateHashes', input),

  // Startup Manager
  getStartupEntries:  ()             => ipcRenderer.invoke('system:getStartup'),
  toggleStartupEntry: (n, v, e)      => ipcRenderer.invoke('system:toggleStartup', n, v, e),

  // Archive Manager
  createArchive:    (opts)       => ipcRenderer.invoke('archive:create', opts),
  extractArchive:   (opts)       => ipcRenderer.invoke('archive:extract', opts),

  // Network Scanner
  scanNetwork:      ()           => ipcRenderer.invoke('network:scan'),

  // Font Preview
  listFonts:        ()           => ipcRenderer.invoke('fonts:list'),

  // Local File Sender
  fileServerStart:      (dir)    => ipcRenderer.invoke('fileserver:start', dir),
  fileServerStop:       ()       => ipcRenderer.invoke('fileserver:stop'),
  fileServerAddFile:    (path)   => ipcRenderer.invoke('fileserver:addFile', path),
  fileServerRemoveFile: (name)   => ipcRenderer.invoke('fileserver:removeFile', name),
  fileServerGetStatus:  ()       => ipcRenderer.invoke('fileserver:getStatus'),
  onNewFileReceived:    (cb)     => ipcRenderer.on('fileserver:newfile', (_, data) => cb(data)),

  // Process Manager
  getProcessList:       ()       => ipcRenderer.invoke('process:list'),
  killProcess:          (pid)    => ipcRenderer.invoke('process:kill', pid),

  // Screenshot
  takeScreenshot:       (opts)   => ipcRenderer.invoke('screenshot:take', opts),

  // Disk Usage
  getDiskUsageByFolder: (dir)    => ipcRenderer.invoke('disk:folderUsage', dir),

  // System Report
  getFullSystemReport:  ()       => ipcRenderer.invoke('system:fullReport'),
  saveSystemReport:     (report) => ipcRenderer.invoke('system:saveReport', report),

  // File Shredder
  shredFile:        (p, passes)  => ipcRenderer.invoke('files:shred', p, passes),

  // Wake-on-LAN
  sendWol:          (mac)        => ipcRenderer.invoke('network:wol', mac),

  // Port Scanner
  scanPorts:        (opts)       => ipcRenderer.invoke('network:scanPorts', opts),
  scanPortRange:    (opts)       => ipcRenderer.invoke('network:scanPortRange', opts),

  // Floating Widgets
  toggleWidget:     (name)       => ipcRenderer.send('toggle-widget', name),

  // Window Controls
  closeWindow:      ()           => ipcRenderer.send('window:close'),
  minimizeWindow:   ()           => ipcRenderer.send('window:minimize'),
  maximizeWindow:   ()           => ipcRenderer.send('window:maximize'),
  toggleFullscreen: ()           => ipcRenderer.send('window:fullscreen'),
})
