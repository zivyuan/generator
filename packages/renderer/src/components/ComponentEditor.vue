<!-- 组件编辑器 -->
<!-- 组件排序, 过滤器筛选 -->

<template>
  <div class="component-editor">
    <Draggable
      v-model="list"
      :class="{ 'component-list': true, draging }"
      group="component"
      ghost-class="component-ghost"
      item-key="name"
      @start="draging = true"
      @end="stopDrag"
    >
      <template
        #item="{ element }"
      >
        <div :class="{ 'material-item': true, disabled: isDisabled(element) }">
          <el-button plain-text class="thumb">
            <img :src="imageBase + '/' + element.materials[0].image">
          </el-button>
          <div class="name">
            {{ element.displayName || element.name }}
          </div>
        </div>
      </template>
    </Draggable>
  </div>
</template>

<script setup lang="ts">
/* eslint-disable @typescript-eslint/no-empty-function */
import { ref, watchEffect } from 'vue';
import Draggable from 'vuedraggable';
import type { IComponent } from '/@/model/nft';

interface IProps {
  modelValue: IComponent[]
  imageBase: string
  whiteList?: string[]
}

const props = withDefaults(defineProps<IProps>(), {
  modelValue: () => [],
  imageBase: '',
  whiteList: () => [],
});
const emit = defineEmits(['update:modelValue'])


const list = ref<IComponent[]>([]);
watchEffect(() => {
  list.value = (<IComponent[]>[]).concat(props.modelValue);
});
const isDisabled = (comp: IComponent) => {
  if (!props.whiteList || props.whiteList.length === 0) return false
  return props.whiteList.indexOf(comp.name) === -1
}
const draging = ref<boolean>(false)

const stopDrag = () => {
  draging.value = false
  emit('update:modelValue', list.value)
}

</script>

<style scoped lang="scss">
.component-editor {
  width: 100%;
}

.component-list {
  display: flex;
}

$check-color: #DDD;

.material-item {
  margin: 0 16px;
  cursor: pointer;

  &.disabled {
    opacity: 0.25;
    .thumb {
      filter: grayscale(100%);
    }
  }
  .thumb {
    width: 64px;
    height: 64px;
    // border-color: $check-color;
    padding: 0;
    overflow: hidden;
    //
    background-color: #FFF;
    background-image: linear-gradient(45deg, $check-color 25%, transparent 25%, transparent 75%, $check-color 75%, $check-color),
            linear-gradient(45deg, $check-color 26%, transparent 26%, transparent 74%, $check-color 74%, $check-color);
    background-size: 20px 20px;
    background-position: 0 0, 50px 50px;
    box-sizing: border;
    transition: all 0.125s;

    &:hover {
      border-width: 3px;
    }

    > span {
      width: 100%;
      width: 100%;

      > img {
        width: 100%;
        height: auto;
      }
    }
  }

  .name {
    text-transform: uppercase;
    margin-top: 0.3em;
    font-size: 14px;
    font-weight: bold;
    transition: all 0.25s;
  }
}
</style>

<style lang="scss">
.component-ghost {
  .name {
    opacity: 0;
  }
}
</style>
