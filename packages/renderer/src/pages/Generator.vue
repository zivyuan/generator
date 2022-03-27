<template>
  <el-container class="main-container">
    <el-header class="header-container" height="140px">
      <div class="header-wrapper">
        <div class="project-info">
          <el-button class="project-path" @click="openProject">{{ projectName }}</el-button>
        </div>
        <div class="group-selector">
          <div class="row">
            <div class="label">分组</div>
            <el-radio-group v-model="selectedGroup" size="small" @change="updateComponentList">
              <el-radio-button v-for="grp in compGroupNames" :key="grp" :label="grp" />
            </el-radio-group>
          </div>
          <div class="row">
            <div class="label">Twitter PFP</div>
            <el-switch v-model="enableTwitterPfp" />
          </div>
        </div>
        <ComponentEditor v-model="componentList" class="component-editor" :image-base="materialPath" :white-list="whiteList" />
      </div>
    </el-header>
    <el-main>
      <NFTPreview :components="componentList" :path="materialPath"
        :white-list="whiteList"
        :output="`${outputPath}/${selectedGroup}-`"
        :twitter-pfp="enableTwitterPfp" />
    </el-main>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { ElMessage } from 'element-plus';
import ComponentEditor from '../components/ComponentEditor.vue';
import NFTPreview from '../components/NFTPreview.vue';
import { NFTProject, NFTProjectObject } from '../model/generator';
import { IComponent } from '/@/model/nft';


let project = new NFTProject('请选择项目...', '')
const projResp = ref<NFTProjectObject>(project)
const projectName = computed(() => projResp.value.name);
const projectPath = computed(() => projResp.value.path);
const outputPath = computed(() => projResp.value.path + '/' + projResp.value.nftPath)
const materialPath = computed(() => `file://${projectPath.value}/materials`);
const compGroupNames = computed<string[]>(() => projResp.value.groups.map(item => item.name))
const selectedGroup = ref('')
const enableTwitterPfp = ref(false)
const whiteList = computed(() => {
  const selgrp = projResp.value.groups.find(item => item.name === selectedGroup.value)
  return selgrp?.components
})
const componentList = ref<IComponent[]>([])

const openProject = (proj: string = '') => {
  window.monobroow.openProject(proj, {
    materialPath: NFTProject.materialPath,
    nftPath: NFTProject.nftPath
  })
    .then(proj => {
      project = new NFTProject()
      if (!proj.canceled) {
        project.fromJSON(proj.project)

        projResp.value = project.toJSON()
        selectedGroup.value = project.groups[0].name
        componentList.value = project.componentsByGroup(project.groups[0].name)
        enableTwitterPfp.value = project.status.twitterPfP
        window.localStorage.setItem('project', project.path)
      } else {
        // projectPath.value = '请选择项目...';
        projResp.value = project.toJSON()
        selectedGroup.value = ''
        componentList.value = []
      }
      console.log('project', projResp.value)
    })
    .catch(err => {
      ElMessage.error(err.toString());
    });
};

watch(() => componentList.value, (orderedList: IComponent[]) => {
  const order = orderedList.map(item => item.name)
  project.updateComponentOrder(order)
  window.monobroow.saveProject(project.toJSON())
})
watch(() => enableTwitterPfp.value, (enable: boolean) => {
  project.status.twitterPfP = enableTwitterPfp.value
  window.monobroow.saveProject(project.toJSON())
})

const updateComponentList = (grp: string) => {
  componentList.value = project.componentsByGroup(grp)
}

// Load last project
const prevProject = window.localStorage.getItem('project')
openProject(prevProject || '');
</script>

<style scoped lang="scss">
.main-container {
  height: 100%;
}

.header-container {
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.05);
}
.header-wrapper {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  height: 100%;
  background-color: #fff;

  > div {
    flex-shrink: 1;
  }
}

.project-info {
  width: 240px;
  margin-right: 40px;
  flex-shrink: 0;
}

.project-path {
  width: 100%;
}

.group-selector {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  width: 280px;
  align-items: center;

  .row {
    display: flex;
    flex-direction: row;
    width: 100%;
    align-items: center;

    &+.row {
      margin-top: 0.8em;
    }
  }

  .label {
    width: 90px;
    margin-right: 0.6em;
    text-align: right;
    flex-shrink: 0;

    &:after {
      content: ':';
    }
  }
}
</style>
