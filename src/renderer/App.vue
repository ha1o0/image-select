<template>
  <div id="app">
    <Launch v-if="shouldShowLaunch"></Launch>
    <Main v-else></Main>
  </div>
</template>

<script>
  import Main from '@/components/Main'
  import Launch from '@/components/Launch'
  import { ipcRenderer, remote } from 'electron'
  export default {
    name: 'test',
    components: {
      Launch,
      Main
    },
    data() {
      return {
        shouldShowLaunch: true
      }
    },
    created() {
      let windowSize = remote.getCurrentWindow().getSize()
      this.shouldShowLaunch = windowSize[0] <= 800
    }
  }
</script>

<style>
  /* CSS */
</style>
