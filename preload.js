const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('versions', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
  ping: (urls,username,password, comment) => ipcRenderer.invoke('grab',JSON.stringify({urls:urls,username,password, comment:comment})),
  getNameGroup:(linkGroup,username,password,) => ipcRenderer.invoke('getNameGroupFB',JSON.stringify({url:linkGroup,username,password}))
})