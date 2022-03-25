<template>
  <el-container class="main-container">
    <el-aside
      class="side-nav"
      width="240px"
    >
      <div>
        <el-button
          class="project-path"
          @click="openProject"
        >
          {{ projectPath }}
        </el-button>
      </div>
    </el-aside>
    <el-main>
      <el-scrollbar height="100%">
        <div> {{ basePath }}</div>
        <div
          v-for="(_, idx) in materials"
          :key="idx"
        >
          Material {{ idx }} > {{ _ }}
        </div>
      </el-scrollbar>
    </el-main>
  </el-container>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus';
import { ref } from 'vue';

const basePath = window.location.href;
const materials = ref<string[]>([]);
const projectPath = ref('请选择项目...');
const openProject = (proj?: string) => {
  window.monobroow.openProject(proj)
    .then(proj => {
      console.log('project slected:', proj);
      if (!proj.canceled && proj.filePaths.length) {
        projectPath.value = proj.filePaths[0].split('/').pop();
        materials.value = proj.filePaths
          .map((item: string, idx: number) => idx === 0 ? '' : item)
          .filter((item: string) => !!item);
      } else {
        // projectPath.value = '请选择项目...';
      }
    })
    .catch(err => {
      ElMessage.error(err.toString());
    });
};

openProject('/Users/zivyuan/GoziLib/Monobroow NFT/nft-studio');
</script>

<style scoped lang="scss">
.main-container {
  height: 100%;
}
.side-nav {
  background-color: #f1f1f1;
  padding: 16px;
}

.project-path {
  width: 100%;
}
</style>
