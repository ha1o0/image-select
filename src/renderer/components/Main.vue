<template>
  <div id="wrapper">
    <main>
      <el-alert v-if="notProject" :closable="false" center class="project-alert"
        :title="projectAlertTitle"
        :type="alertType">
      </el-alert>
      <div class="main-container">
        <div class="left-side" style="width: 1000px;">
          <el-card>
            <div slot="header" class="clearfix">
                <span>操作步骤</span>
              </div>
              <div class="base-area">
                <el-form
                  ref="formRef"
                  :model="form"
                  key="ConductorDimensionForm_1"
                  label-position="left"
                  label-width="600px"
                  class="form"
                  @submit.native.prevent
                >
                  <div class="form-ordinate">
                    <el-form-item label="1. 选择身份证号文本文件（txt类型），从excel中复制身份证号码列粘贴到txt文件中即可">
                      <el-button type="primary" size="small" @click="openTxtFile">点击选择</el-button>
                      <p v-show="txtFilePath">已选文件：{{ txtFilePath }}</p>
                      <!-- <el-upload
                        ref="uploads"
                        class="upload-demo"
                        action="123"
                        accept=".txt"
                        :on-change="selectIdTxtFile"
                        :limit="1"
                        :auto-upload="false"
                        :file-list="fileList">
                        <el-button size="small" type="primary">点击选择</el-button>
                      </el-upload> -->
                    </el-form-item>
                    <el-form-item label="2. 选择身份证电子照片（即原始所有1000张照片）所在文件夹">
                      <el-button type="primary" size="small" @click="selectOriginPictureFolder">点击选择</el-button>
                      <p v-show="sourceFolderPath">已选文件夹：{{ sourceFolderPath }}</p>
                    </el-form-item>
                    <el-form-item label="3. 选择筛选出的照片（即需要的700张照片）要保存的文件夹">
                      <el-button type="primary" size="small" @click="selectTargetSaveFolder">点击选择</el-button>
                      <p v-show="targetFolderPath">已选文件夹：{{ targetFolderPath }}</p>
                    </el-form-item>
                    <el-form-item label="4. 点击开始筛选">
                      <el-button type="primary" size="small" @click="start">开始</el-button>
                      <p v-show="targetFilePath">正在处理中，请不要进行其他操作……</p>
                    </el-form-item>
                  </div>
                </el-form>
              </div>
          </el-card>
        </div>
        <div class="right-side" style="width: calc(100% - 1000px);overflow: scroll;" v-show="idList.length > 0">
          <p v-for="(value, index) in idList" :key="index">{{ value }}</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
  import { ipcRenderer } from 'electron'
  import { setTimeout } from 'timers'
  import controlPanel from "control-panel"
  import fs, { read } from 'fs'
  import Project from "@/../Project";
  import { app, protocol, BrowserWindow, screen } from 'electron'
  const storage = require('electron-json-storage')
  // console.log( __dirname + '/TestDllss.dll')
  
  export default {
     data () {
      return {
        form: {},
        fileList: [],
        leftSideFlexValue: 2.5,
        currentProjectPath: "111",
        alertType: "error",
        notProject: false,
        isProject: false,
        firstLoad: true,
        shape: 0,
        problemType: 0,
        startPlot: false,
        willPlotModel: false,
        changeImage: false,
        state: {
          center: [0, 0, 0],
          eye: [0, 0, 0],
          up: [0, 1, 0],
          polar: [Math.PI / 4, Math.PI / 16, 0],
          dpolar: [0, 0, 0],
          displacement: 0,
          lineWidth: 1.25,
          mode: "stress",
          elements: true,
          lines: true,
          ortho: true,
          subdivisions: 3,
          meshData: {}
        },
        imageSrc: require('@/assets/launch.png'),
        txtFilePath: '',
        idList: [],
        sourceFolderPath: '',
        targetFolderPath: '',
        targetFilePath: '',
      };
    },
    name: 'main-page',
    computed: {
      projectAlertTitle () {
        return this.currentProjectPath != "" ? "" : "请按照提示操作"
      }
    },
    created() {
      let size = screen.getPrimaryDisplay().workAreaSize
      if (size.width >= 1920) {
        this.leftSideFlexValue = 2.5
      } else if (size.width >= 1600) {
        this.leftSideFlexValue = 3.0
      } else if (size.width >= 1360) {
        this.leftSideFlexValue = 3.5
      } else {
        this.leftSideFlexValue = 4.0
      }
      ipcRenderer.send('checkProject', '')
      ipcRenderer.on('openProject', (event, arg) => {
        let path = arg
        this.currentProjectPath = path
        this.notProject = path == ""
        this.alertType = path != "" ? "" : "error"
        this.notProject = path == ""
        this.isProject = path != ""
        if (path != "") {
          window.EventBus.$emit('resumeConfig', "")
          console.log("send resume signal")
          this.$global.projectPath = path[0]
          if (this.firstLoad) {
            this.firstLoad = false
            setTimeout(() => {
              window.EventBus.$emit('resumeConfig', "")
            }, 100)
          }
        }
      })
      ipcRenderer.on('openExtractDofDialog', (event, arg) => {
        window.EventBus.$emit('openPostProcessingExtractDofs', arg)
      })
      this.listenPlot()
      // 改变右侧图片
      window.EventBus.$on('changeImageInfo', (imageName) => {
        this.imageSrc = require('@/assets/' + imageName + '.png')
        this.changeImage = true;
      })
      ipcRenderer.on('selectedOriginPictureFolder', (event, arg) => {
        console.log(event, arg)
        this.sourceFolderPath = arg && arg[0] || ''
      })
      ipcRenderer.on('selectedTargetSaveFolder', (event, arg) => {
        console.log(event, arg)
        this.targetFolderPath = arg && arg[0] || ''
      })
      ipcRenderer.on('openedTxtFile', (event, arg) => {
        console.log(event, arg)
        this.txtFilePath = arg && arg[0] || ''
        if (!this.txtFilePath) {
          return
        }
        Project.readFileByLine(this.txtFilePath.toString(), (resultArray) => {
          this.idList = resultArray
        })
      })
    },
    methods: {
      // selectIdTxtFile() {
      //   const file = this.$refs.uploads.uploadFiles[0].raw
      //   let reader = new FileReader()
      //   if (typeof FileReader === 'undefined') {
      //     this.$message({
      //       type: 'error',
      //       message: '您的浏览器不支持读取文件'
      //     })
      //     return
      //   }
      //   reader.readAsText(file)
      //   reader.onload = (e) => {
      //     const result = e.target.result
      //     const list = result.split(/\n/g)
      //     this.idList = list.filter(item => item).map(item => item.toString())
      //     list.filter(item => item).map(item => item.toString()).forEach(item => {
      //       const a = 10
      //       console.log(item, typeof(item), item.toString() === a.toString())
      //     })
      //     console.log(this.idList, list.indexOf('10'), Array.isArray(this.idList))
      //   }
      // },
      openTxtFile() {
        ipcRenderer.send('openTxtFile', '')
      },
      selectOriginPictureFolder() {
        ipcRenderer.send('selectOriginPictureFolder', '')
      },
      selectTargetSaveFolder() {
        ipcRenderer.send('selectTargetSaveFolder', '')
      },
      start() {
        if (this.idList.length === 0) {
          this.$message({
            type: 'error',
            message: '请选择身份证号码所在txt文件'
          })
          return
        }
        if (!this.sourceFolderPath) {
          this.$message({
            type: 'error',
            message: '请选择身份证电子照片（即原始所有1000张照片）所在文件夹'
          })
          return
        }
        if (!this.targetFolderPath) {
          this.$message({
            type: 'error',
            message: '请选择筛选出的照片（即需要的700张照片）要保存的文件夹'
          })
          return
        }
        const isDirectory = path => fs.statSync(path).isDirectory()
        const getDirectories = path =>
            fs.readdirSync(path).map(name => path + '/' + name).filter(isDirectory)
        const isFile = path => fs.statSync(path).isFile()
        const getFiles = path =>
            fs.readdirSync(path).map(name => path + '/' + name).filter(isFile)
        const getFilesRecursively = (path) => {
            let dirs = getDirectories(path)
            let files = dirs
                      .map(dir => getFilesRecursively(dir)) // go through each directory
                      .reduce((a,b) => a.concat(b), [])    // map returns a 2d array (array of file arrays) so flatten
            
            return files.concat(getFiles(path))
        }
        const filePaths = getFilesRecursively(this.sourceFolderPath)
        // const targetFilePaths = filePaths.filter(path => {
        //   const lastDotIndex = path.lastIndexOf('.')
        //   const lastXiegangIndex = path.lastIndexOf('/')
        //   const fileName = path.substring(lastXiegangIndex + 1, lastDotIndex)
        //   console.log(fileName, typeof(fileName), this.idList.indexOf(fileName) > -1)
        //   return this.idList.includes(fileName)
        // })
        console.log(this.idList)
        this.targetFilePath = 'start'
        setTimeout(() => {
          try {
            filePaths.forEach(path => {
              const lastDotIndex = path.lastIndexOf('.')
              const lastXiegangIndex = path.lastIndexOf('/')
              const fileName = path.substring(lastXiegangIndex + 1, lastDotIndex)
              const type = path.substring(lastDotIndex)
              if (this.idList.includes(fileName)) {
                this.targetFilePath = this.targetFolderPath + '/' + fileName + type
                fs.copyFileSync(path, this.targetFilePath)
                console.log(new Date().getTime())
              }
            })
            console.log('last: ', new Date().getTime())
            this.targetFilePath = ''
            this.$message({
              type: 'success',
              message: '筛选结束',
            })
          } catch (error) {
            this.$message({
              type: 'error',
              message: '处理失败：' + error,
            })
          }
        }, 1000)
        
      },
      rebuildMesh() {
        let jsonPath = `${this.$global.projectPath}/data/gridDivision/mesh.json`
        if (!fs.existsSync(jsonPath)) {
          this.$message({
            message: "mesh.json文件不存在！",
            center: true,
            duration: 3000,
            type: "error"
          })
          return
        }
        this.state.meshData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
        this.$nextTick(() => {
          this.shape = 0
          this.$nextTick(() => {
            const regl = require("regl")({
              canvas: this.$refs.webglCanvas,
              extensions: "OES_element_index_uint"
            })
            let temp = createMesh({ regl })
            let mesh = temp(this.state.meshData, this.state.subdivisions)
            this.state.center = mesh.center.slice()
            this.state.polar[0] = Math.PI / 4
            this.state.polar[1] = Math.PI / 16
            this.state.polar[2] = Math.log(1 * mesh.radius)

            let cameraTemp = camera({ regl })
            regl.frame(({ tick }) => {
              cameraTemp.integrate(this.state)
              regl.clear({
                color: [0, 0, 0, 0],
                depth: 1
              })
              cameraTemp.setup(this.state, () => {
                mesh.draw(this.state);
              })
            })
            gesture({
              canvas: regl._gl.canvas,
              onZoom: dz => {
                this.state.dpolar[2] += 0.25 * dz  //放大缩小速度
              },
              onRotate: (dx, dy) => {
                this.state.dpolar[0] += dx   //双轴旋转速度
                this.state.dpolar[1] -= dy
              }
            })
          })
        })
      },
      plotModel(data) {
        switch(this.shape) {
          case 1:
            this.$refs.cubeModel.reRender({long: Number(data.dim_1), width: Number(data.dim_2), height: Number(data.dim_3)})
          break
          case 2:
            let externalDim = Number(data.dim_2)
            let internalDim = Number(data.dim_1)
            let height = Number(data.dim_3)

            if (externalDim <= internalDim) {
              this.$message({
                  message: "外径必须大于内径",
                  center: true,
                  duration: 3000,
                  type: "error"
              })
              return
            }
            this.$refs.concentricCylinder.reRender({externalDim, internalDim, height})
          break
          case 3:
            this.$refs.cylinder.reRender({height: Number(data.dim_2), radius: Number(data.dim_1)})
          break
          default:
        }
      },
      listenPlot() {
        window.EventBus.$on('plot', data => {
          if (this.shape != data.shape) {
            this.$nextTick(() => {
              this.shape = data.shape
            })
            setTimeout(() => {
              this.plotModel(data)
            }, 300)
          } else {
            this.plotModel(data)
          }
        })
      },
      plotModelOrMesh(type) {
        this.shape = 0
        this.startPlot = true
        if (type === "model") {
          this.willPlotModel = true
          this.$refs.conditions.$refs.geometricModel.plot()
        } else {
          this.willPlotModel = false
          this.$nextTick(() => {
            this.shape = 1
          })
        }
      }
    }
  }
</script>

<style lang="scss">
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    font-family: "Helvetica Neue",Helvetica,"PingFang SC","Hiragino Sans GB","Microsoft YaHei","微软雅黑",Arial,sans-serif;

    ::-webkit-scrollbar-track-piece { //滚动条凹槽的颜色，还可以设置边框属性
      background-color: white;
    }
    ::-webkit-scrollbar {//滚动条的宽度
      width: 3px;
      // height:px;
    }
    ::-webkit-scrollbar-thumb {//滚动条的设置
      background-color:#dddddd;
      // background-clip: padding-box;
      min-height: 28px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background-color: white;
    }
  }

  body { 
    // font-family: 'Source Sans Pro', sans-serif;
    // background:
    //   radial-gradient(
    //     ellipse at top left,
    //     rgba(255, 255, 255, 1) 40%,
    //     rgba(229, 229, 229, .9) 100%
    //   ); 
  }

  #wrapper {
    height: 100vh;
    padding: 10px;
    width: 100vw;
  }

  main {
    .fast-menu {
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      padding: 10px;
      i {
        margin-right: 20px;
        font-size: 20px;
      }
    }
    .project-alert {
      margin: 10px 0;
    }
    .main-container {
      display: flex;
      justify-content: space-between;
      .left-side {
        margin-right: 10px;
        display: flex;
        flex-direction: column;
        align-content: space-around;
        // justify-content: space-around;
        height: 980px;
        overflow: scroll;
        .conditions {
          flex: 10;
          .type-title {
            background-color:cornflowerblue;
            display: flex;
            justify-content: space-between;
            text-align: center;
            margin-bottom: 20px;
            border-radius: 10px;
          }
          .el-card__header {
            text-align: center;
            background-color:cornsilk;
            height: 40px;
            padding: 8px 20px;
          }  
        }
      }
      .right-side {
        border: 1px solid #e2e2e2;
        flex: 8;
        display: flex;
        flex-direction: column;
        height: 600px;
        padding: 10px 10px 0 10px;
        .threed-plot {
          display: flex;
          flex-direction: row;
          .threed-plot-text {
            flex: 15;
          }
          .geo-btn {
            flex: 1;
          }
          .grid-btn {
            flex: 1;
          }
        }
        .webgl-canvas {
          margin: 20px;
          height: 900px;
          width: 90%;
        }
        .fill-image {
          img {
            width: 100%;
            height: 100%;
          }
        }
      }
    }
  }

  .fade-enter-active, .fade-leave-active {
    transition: opacity .2s
  }
  .fade-enter, .fade-leave-active {
    opacity: 0
  }

</style>
