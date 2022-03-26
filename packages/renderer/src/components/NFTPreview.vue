<template>
  <div class="nft-previewer">
    <el-scrollbar height="100%" @scroll="onListScroll">
      <div :style="`height: ${listHeight}px;`">
        <div class="nft-list">
          <div v-for="item in nfts" :key="item.id" class="nft-item">
            <!-- <div class="name">{{ item.id }} of {{ totalNft }} </div> -->
            <div class="layers">
              <img v-for="(comp, imgIdx) in components" :key="imgIdx"
                :style="`z-index: ${ 100 - imgIdx }`"
                :src="path + '/' + comp.materials[item.dna[imgIdx]].image" />
            </div>
          </div>
        </div>
      </div>
    </el-scrollbar>
    <HEX />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue';
import HEX from '../../assets/hex.svg';
import { IComponent, INft, Rank } from '../model/nft';

interface IProps {
  components: IComponent[]
  path: string
  whiteList?: string[]
}

const props = withDefaults(defineProps<IProps>(), {
  components: () => [],
  whiteList: () => [],
  path: '',
})

const totalNft = computed(() => {
  if (!props.components) return 0;

  const total = props.components.map(item => item.materials.length)
    .reduce((a, b) => a * b, 1)
  return total;
})
const cellSize = 256 + 16
const cols = Math.floor(window.innerWidth / cellSize)
const rows = Math.ceil(totalNft.value / cols)
const winRows = Math.floor(window.innerHeight / cellSize)
const listHeight = computed(() => rows * cellSize)
// 编号计算
let nftMod: number[] = []
let nftMul: number[] = []
const getDNA = (index: number): number[] => {
  return nftMod.map((mod, idx) => Math.floor(index / nftMul[idx]) % mod)
}
const nfts = ref<INft[]>([])

watchEffect(() => {
  nftMod = props.components.map(item => item.materials.length)
  nftMul = nftMod.map((item, idx) => {
    return idx === 0 ? 1 : nftMod.slice(0, idx).reduce((a, b) => a*b, 1)
  })
  const nnfts: INft[] = new Array(winRows * cols).fill(0).map((_, idx) => ({
    id: idx,
    dna: getDNA(idx),
    hash: '',
    layers: [],
    ssr: false,
    rank: Rank.Normal
  }))
  nfts.value = nnfts
})

const onListScroll = (scroll: {
  scrollTop: number,
  scrollLeft: number,
})=> {
  console.log(scroll, cols, rows)
}
</script>

<style scoped lang="scss">
.nft-previewer {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.nft-list {
  margin-right: -8px;
  margin-left: -8px;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
}

.nft-item {
  width: 256px;
  height: 256px;
  margin: 8px;

  .layers {
    width: 100%;
    height: 100%;
    position: relative;
    overflow: hidden;

    > img {
      position: absolute;
      width: 100%;
      height: 100%;
      left: 0;
      top: 0;
    }

    &.twitter {
      clip-path: url("#hex-hw-shapeclip-clipconfig");
      height: calc(100% - 12px);
      width: calc(100% - 12px);
    }
  }
}
</style>
