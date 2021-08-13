import {
  app,
  BrowserWindow,
  Menu,
  dialog,
  ipcMain,
  session
} from 'electron'
import Project from '../Project'
const storage = require('electron-json-storage')
/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}
let projectJsonFileName = "Project.json"
let mainWindow
let launchWindow

var fileFilter = {
  textFilter: [
    { name: 'Text(.txt, .dat)', extensions: ['txt', 'dat'] }
  ]
}
const winURL = process.env.NODE_ENV === 'development' ?
  `http://localhost:9080` :
  `file://${__dirname}/index.html`

function createWindow() {
  /**
   * Initial window options
   */
  setAppLaunchPage()
  // mainWindow.setMenu(null)
}

function setAppLaunchPage() {
  launchWindow = new BrowserWindow({
    backgroundColor: '#ffffff',
    autoHideMenuBar: true,
    center: true,
    movable: true,
    minimizable: false,
    maximizable: false,
    resizable: false,
    closable: false,
    alwaysOnTop: true,
    height: 532,
    width: 800,
    frame: false,
    show: false,
    webPreferences: {
      webSecurity: false
    }
  })
  launchWindow.loadURL(winURL)
  launchWindow.once('ready-to-show', () => {
    launchWindow.show()
  })
  listenToMain()
}

function setAppMainPage() {
  launchWindow.hide()
  mainWindow = new BrowserWindow({
    height: 1080,
    useContentSize: false,
    width: 1920,
    maxHeight: 1080,
    maxWidth: 1920,
    frame: true,
    show: true
  })
  setMenu()
  // listenCheckProject()
  // listenChangeMenu()
  // listenSelectOtherProgram()
  // listenSelectConfig()
  // listenImportBHData()
  // listenImportScanFreqData()
  // listenImportScanPathData()
  // listenImportExcitSignData()
  // listenImportBFieldPathData()
  // listenImportExperData()
  listenSelectOriginPictureFolder()
  listenSelectTargetSaveFolder()
  listenOpenTxtFile()

  mainWindow.loadURL(winURL)
  mainWindow.on('closed', () => {
    mainWindow = null
    if (launchWindow) {
      launchWindow.close()
      launchWindow = null
    }
    app.exit(0)
  })
}

function listenToMain() {
  ipcMain.on('showLaunch', (event, arg) => {
    launchWindow.show()
  })
  ipcMain.on('toMain', (event, arg) => {
    setAppMainPage()
    mainWindow.reload()
    // app.relaunch({args: process.argv.slice(1).concat(['--relaunch'])})
    // app.quit()
  })
}

function setMenu(shape='1') {
  const menuBar = [{
      label: '文件',
      submenu: [
        {
          label: '退出',
          role: 'quit'
        }
      ]
    },
    {
      label: '视图',
      submenu: [{
          label: '重新加载',
          role: 'reload'
        },
        {
          label: '恢复缩放',
          role: 'resetzoom'
        },
        {
          label: '放大',
          role: 'zoomin'
        },
        {
          label: '缩小',
          role: 'zoomout'
        },
        {
          label: '全屏',
          role: 'togglefullscreen'
        }
      ]
    },
    {
      label: '帮助',
      role: 'help',
      submenu: [
        {
          label: '关于',
          click() {
            showVersion()
          }
        }
      ]
    }
  ]
  const menu = Menu.buildFromTemplate(menuBar)
  Menu.setApplicationMenu(menu)
}

function listenChangeMenu() {
  ipcMain.on('ShapeForPost', (event, arg) => {
    setMenu(arg)
  })
}

function listenCheckProject() {
  ipcMain.on('checkProject', (event, arg) => {
    checkCurrentProject()
  })
}

function listenSelectOtherProgram() {
  ipcMain.on('selectOtherProgram', (event, arg) => {
    selectOtherProgram(arg)
  })
}

function listenSelectConfig() {
  ipcMain.on('selectConfig', (event, arg) => {
    selectConfig(arg)
  })
}

function listenImportBHData() {
  ipcMain.on('importBHData', (event, arg) => {
    importHBData(arg)
  })
}

function listenImportScanFreqData() {
  ipcMain.on('importScanFreqData', (event, arg) => {
    importScanFreqData(arg)
  })
}

function listenImportScanPathData() {
  ipcMain.on('importScanPathData', (event, arg) => {
    importScanPathData(arg)
  })
}

function listenImportExcitSignData() {
  ipcMain.on('importExcitSignData', (event, arg) => {
    importExcitSignData(arg)
  })
}

function listenImportBFieldPathData() {
  ipcMain.on('importBFieldPathData', (event, arg) => {
    importBFieldPathData(arg)
  })
}

function listenImportExperData() {
  ipcMain.on('importExperData', (event, arg) => {
    importExperData(arg)
  })
}

function listenOpenTxtFile() {
  ipcMain.on('openTxtFile', (event, arg) => {
    openTxtFile()
  })
}

function listenSelectOriginPictureFolder() {
  ipcMain.on('selectOriginPictureFolder', (event, arg) => {
    selectOriginPictureFolder()
  })
}

function listenSelectTargetSaveFolder() {
  ipcMain.on('selectTargetSaveFolder', (event, arg) => {
    selectTargetSaveFolder()
  })
}

function selectOriginPictureFolder() {
  let openProjectProperties = ['openDirectory']
  dialog.showOpenDialog(mainWindow, {
    properties: openProjectProperties
  }, (path) => {
      mainWindow.webContents.send('selectedOriginPictureFolder', path)
  })
}

function selectTargetSaveFolder() {
  let openProjectProperties = ['openDirectory']
  dialog.showOpenDialog(mainWindow, {
    properties: openProjectProperties
  }, (path) => {
      mainWindow.webContents.send('selectedTargetSaveFolder', path)
  })
}

function openTxtFile() {
  let openProjectProperties = ['openFile']
  // let fileFilters = [{ name: 'Project', extensions: ['json'] }]
  dialog.showOpenDialog(mainWindow, {
    properties: openProjectProperties,
    filters: fileFilter.textFilter
  }, async (path) => {
    if (path && path.length > 0) {
      mainWindow.webContents.send(`openedTxtFile`, path)
    }
  })
}

function checkCurrentProject() {
  storage.has('currentProject', (error, hasKey) => {
    if (error || !hasKey) {
      mainWindow.webContents.send('openProject', "")
    } else {
      storage.get('currentProject', async (error, path) => {
        if (error) throw error
        let result = await Project.checkProjectFile(path + "/Project.json")
        // console.log(result)
        if (result == 0) {
          mainWindow.webContents.send('openProject', "")
        } else {
          mainWindow.webContents.send('openProject', path)
        }
      })
    }
  })
}

function newProject() {
  let newProjectProperties = ['openDirectory']
  dialog.showOpenDialog(mainWindow, {
    properties: newProjectProperties
  }, async (path) => {
    let result = await Project.createNewProjectFile(path)
    if (result == 1) {
      storage.set('currentProject', path, (error) => {
        if (error) throw error
        Project.writeParameterInMain(path)
        mainWindow.webContents.send('openProject', path)
      })
    }
  })
}

function openProject() {
  let openProjectProperties = ['openDirectory']
  // let fileFilters = [{ name: 'Project', extensions: ['json'] }]
  dialog.showOpenDialog(mainWindow, {
    properties: openProjectProperties
  }, async (path) => {
    let result = await Project.checkProjectFile(path + "/Project.json")
    // console.log('open',result)
    if (result == 1) {
      storage.set('currentProject', path, (error) => {
        if (error) throw error
        Project.writeParameterInMain(path)
        mainWindow.webContents.send('openProject', path)
      })
    } else if (result == 0) {
      mainWindow.webContents.send('openProject', "")
    }
  })
}

function importHBData(type) {
  let openProjectProperties = ['openFile']
  // let fileFilters = [{ name: 'Project', extensions: ['json'] }]
  dialog.showOpenDialog(mainWindow, {
    properties: openProjectProperties,
    filters: fileFilter.textFilter
  }, async (path) => {
    // console.log('selected path: ', path)
    if (path && path.length > 0) {
      mainWindow.webContents.send(`importBHData`, path, type)
    }
  })
}

function importScanFreqData(type) {
  let openProjectProperties = ['openFile']
  dialog.showOpenDialog(mainWindow, {
    properties: openProjectProperties,
    filters: fileFilter.textFilter
  }, async (path) => {
    if (path && path.length > 0) {
      mainWindow.webContents.send(`importScanFreqData`, path, type)
    }
  })
}

function importScanPathData(type) {
  let openProjectProperties = ['openFile']
  dialog.showOpenDialog(mainWindow, {
    properties: openProjectProperties,
    filters: fileFilter.textFilter
  }, async (path) => {
    if (path && path.length > 0) {
      mainWindow.webContents.send(`importScanPathData`, path, type)
    }
  })
}

function importExcitSignData(type) {
  let openProjectProperties = ['openFile']
  dialog.showOpenDialog(mainWindow, {
    properties: openProjectProperties,
    filters: fileFilter.textFilter
  }, async (path) => {
    if (path && path.length > 0) {
      mainWindow.webContents.send(`importExcitSignData`, path, type)
    }
  })
}

function importBFieldPathData(type) {
  let openProjectProperties = ['openFile']
  dialog.showOpenDialog(mainWindow, {
    properties: openProjectProperties,
    filters: fileFilter.textFilter
  }, async (path) => {
    if (path && path.length > 0) {
      mainWindow.webContents.send(`importBFieldPathData`, path, type)
    }
  })
}

function importExperData(type) {
  let openProjectProperties = ['openFile']
  dialog.showOpenDialog(mainWindow, {
    properties: openProjectProperties,
    filters: fileFilter.textFilter
  }, async (path) => {
    if (path && path.length > 0) {
      mainWindow.webContents.send(`importExperData`, path, type)
    }
  })
}

function selectOtherProgram(programName) {
  let openProjectProperties = ['openFile']
  // let fileFilters = [{ name: 'Project', extensions: ['json'] }]
  dialog.showOpenDialog(mainWindow, {
    properties: openProjectProperties
  }, async (path) => {
    if (path && path.length > 0) {
      storage.set(`${programName}Path`, path, (error) => {
        if (error) throw error
        mainWindow.webContents.send(`hasSelected${programName}`, path)
      })
    }
  })
}

function selectConfig() {
  let openProjectProperties = ['openFile']
  dialog.showOpenDialog(mainWindow, {
    properties: openProjectProperties,
    filters: fileFilter.textFilter
  }, async (path) => {
    if (path && path.length > 0) {
      mainWindow.webContents.send(`hasSelectedConfig`, path)
    }
  })
}

function callExtractDofDll(shape) {
  mainWindow.webContents.send('openExtractDofDialog', shape)
}

function showVersion() {
  var pjson = require('../../package.json')
  const options = {
      type: 'info',
      title: '信息',
      message: `软件名: 照片筛选   版本号: ${pjson.version}`,
  }
  dialog.showMessageBox(options)
}

function openOtherProgram(programName) {
  storage.get(`${programName}Path`, async (error, path) => {
    let programPath = (path && path.length > 0) ? path[0] : ''
    if (!programPath) {
      dialog.showErrorBox("路径不存在！", "请先选择软件路径")
      return
    }
    Project.openOtherProgram(programPath)
  })
}


app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})