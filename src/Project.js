import fs, { read } from 'fs'
import readline from 'readline'
import path from 'path'
import {
  dialog
} from 'electron'
import { callbackify } from 'util';

function createProjectFile(projectFile) {
  return new Promise((resolve) => {
    let data = {
      created: new Date()
    }
    fs.writeFile(projectFile, JSON.stringify(data), (err) => {
      if (err) {
        console.log(err)
        resolve(0)
        return
      }
      let path = projectFile.replace('/Project.json', '')
      let dataPath = `${path}/data`
      deleteDir(dataPath)
      fs.mkdirSync(dataPath)
      fs.mkdirSync(`${dataPath}/problemType`)
      fs.mkdirSync(`${dataPath}/geometricModel`)
      fs.mkdirSync(`${dataPath}/gridDivision`)
      fs.mkdirSync(`${dataPath}/materialProperty`)
      fs.mkdirSync(`${dataPath}/excitationPara`)
      fs.mkdirSync(`${dataPath}/postProcessing`)
      resolve(1)
    })
  }).catch(error => {
    console.log(error.message)
    return 0
  })
}

function deleteDir(path) {
  let files = []
  if (fs.existsSync(path)) {
    files = fs.readdirSync(path)
    files.forEach(file => {
      let filePath = `${path}/${file}`
      if (fs.statSync(filePath).isDirectory()) {
        deleteDir(filePath)
      } else {
        fs.unlinkSync(filePath)
      }
    })
    fs.rmdirSync(path)
  }
}
export default class Project {

  static trim = (str) => {
    return str.replace(/(^\s*)|(\s*$)/g, '')
  }

  // return array whose element is the data of each line
  static readFileByLine = (file, callback) => {
    const readlineFile = readline.createInterface({
      input: fs.createReadStream(file)
    })
    let resultArray = []
    readlineFile.on("line", (lineData) => {
      resultArray.push(Project.trim(lineData))
    })
    readlineFile.on("close", () => {
        callback(resultArray)
    })
  }

  static openOtherProgram = (exePath) => {
    var child = require('child_process').execFile;
    child(exePath, function (err, data) {
      if (err) {
        console.error(err);
        return;
      }

      console.log(data.toString());
    });
  }

  static writeParameter = (data, vue) => {
    Project.checkDirectory(vue.$global.parameterFilePath)
    fs.writeFileSync(`${vue.$global.parameterFilePath}/${vue.$global.parameterFileName}`, data)
  }

  static writeParameterInMain = (data) => {
    const parameterFilePath = "c:/ProgramData/XJTUNDT"
    const parameterFileName = "parameter.dat"
    Project.checkDirectory(parameterFilePath)
    fs.writeFileSync(`${parameterFilePath}/${parameterFileName}`, data)
  }

  static copyNecessaryFileToSystem = (vue, nessaryFilePath) => {
    const systemDataPath = "c:/ProgramData/XJTUNDT"
    Project.checkDirectory(systemDataPath)
    let isCopyError = false
    fs.readdir(nessaryFilePath, (err, files) => {
      if (err) {
        isCopyError = true
        return
      }
      files.forEach((fileName) => {
        fs.copyFile(`${nessaryFilePath}/${fileName}`, `${systemDataPath}/${fileName}`, err => {
          if (err) {
            isCopyError = true
          }
        })
      })
      if (isCopyError) {
        vue.$message({
          message: `拷贝必要文件失败, 请重启软件`,
          center: true,
          type: "error"
        })
      }
    })
  }

  static checkDirectory = (path, needCreate = true) => {
    if (fs.existsSync(path)) {
      return 1
    } else if (needCreate) {
      fs.mkdirSync(path)
      return 0
    }
  }

  static saveConfig = (data, vue) => {
    let dataDir = `${vue.$global.projectPath}/data`
    Project.checkDirectory(dataDir)
    Project.checkDirectory(`${dataDir}/${vue.dirName}`)
    fs.writeFileSync(`${dataDir}/${vue.dirName}/config.dat`, data)
    vue.$message({
      message: "保存成功",
      center: true,
      duration: 3000,
      type: "success"
    })
    vue.disableSave = false
  }

  static preSaveForPost = (data, vue) => {
    let dataDir = `${vue.$global.projectPath}/data`
    Project.checkDirectory(dataDir)
    Project.checkDirectory(`${dataDir}/${vue.dirName}`)
    fs.writeFileSync(`${dataDir}/${vue.dirName}/config.dat`, data)
    vue.disableButton = false
  }

  static saveMixConfig = (data, vue) => {
    let dataDir = `${vue.$global.projectPath}/data`
    console.log("start to save", `${dataDir}/config.dat`)
    fs.writeFileSync(`${dataDir}/config.dat`, data)
    vue.$message({
      message: "保存成功",
      center: true,
      duration: 3000,
      type: "success"
    })
    console.log("save success")
    vue.calBtnDisabled = false
  }

  static getProblemTypeFromConfig = (path) => {
    let result = -1
    let data = fs.readFileSync(path, 'utf-8')
    let problemTypeMark = "400 Problem type"
    if (data && data.indexOf(problemTypeMark) > -1) {
      let dataLineList = data.split(/[\n]/)
      for (let i = 0; i < dataLineList.length; i++) {
        if (dataLineList[i].indexOf(problemTypeMark) > -1) {
          result = + dataLineList[i + 1]
        }
      }
    }

    return result
  }

  static getScanPathLengthFromConfig = (path) => {
    let result = -1
    let data = fs.readFileSync(path, 'utf-8')
    let scanPathLengthMark = "435 Scanning information"
    if (data && data.indexOf(scanPathLengthMark) > -1) {
      let dataLineList = data.split(/[\n]/)
      for (let i = 0; i < dataLineList.length; i++) {
        if (dataLineList[i].indexOf(scanPathLengthMark) > -1) {
          result = + dataLineList[i + 1]
        }
      }
    }

    return result
  }

  static checkProjectFile = (path) => {
    return new Promise((resolve) => {
      if (path == 'undefined/Project.json') {
        resolve(2)
      }
      if (fs.existsSync(path)) {
        fs.readFile(path, 'utf-8', (err, data) => {
          if (err) {
            resolve(0)
          } else {
            let dataJson = JSON.parse(data)
            if (dataJson.hasOwnProperty("created")) {
              resolve(1)
            } else {
              resolve(0)
            }
          }
        })
      } else {
        resolve(0)
      }
    }).catch(error => {
      console.log(error.message)
      return 0
    })
  }

  static createNewProjectFile = async (path) => {
    return new Promise(async (resolve) => {
      let projectFile = `${path}/Project.json`
      const options = {
        type: 'info',
        title: '信息',
        message: "选定目录已存在项目是否覆盖?",
        buttons: ['是,在选定目录新建空项目', '否,留在当前项目']
      }
      if (fs.existsSync(projectFile)) {
        dialog.showMessageBox(options, async (index) => {
          if (index == 0) {
            let result = await createProjectFile(projectFile)
            resolve(result)
          }
          resolve(0)
        })
      } else {
        let result = await createProjectFile(projectFile)
        resolve(result)
      }

    }).catch(error => {
      console.log(error.message)
      return 0
    })
  }
}