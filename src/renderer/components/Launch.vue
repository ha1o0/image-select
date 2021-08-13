<template>
  <div class="launch-container">
    <div class="info">
      <h4 class="developer"></h4>
    </div>
    <button class="loading" @click="toMain"></button>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron'
import { setTimeout } from 'timers'
import Project from '@/../Project'
import path from 'path'
export default {
  data() {
    return {
      loadingText: '正在载入',
      intervalTimer: null
    }
  },
  created() {
    this.intervalTimer = window.setInterval(this.setLoading, 300)
  },
  mounted() {
    ipcRenderer.send('showLaunch', '')
    const nessaryFilePath = 'dats'
    Project.copyNecessaryFileToSystem(this, nessaryFilePath)
    setTimeout(() => {
      this.toMain()
    }, 3000)
  },
  methods: {
    setLoading() {
      if (this.loadingText.length >= 10) {
        this.loadingText = '正在载入'
      } else {
        this.loadingText = this.loadingText + '.'
      }
    },
    toMain() {
      window.clearInterval(this.intervalTimer)
      ipcRenderer.send('toMain', '')
    }
  }
}
</script>

<style lang="scss">
.launch-container {
  width: 800px;
  height: 532px;
  overflow-x: hidden;
  overflow-y: hidden;
  background: url(../assets/launch.png) no-repeat;
  background-size: contain;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  .info {
    text-align: center;
    margin-bottom: 50px;
    .developer {
      color: white;
    }
  }

  .loading {
    position: absolute;
    width: 100px;
    text-align: left;
    right: 30px;
    bottom: 20px;
    color: white;
    background: transparent;
    border: none;
  }
}
  
</style>