<template>
  <div class="nft-previewer">
    <el-scrollbar height="100%" @scroll="onListScroll">
      <div class="nft-list-wrapper" :style="`height: ${listHeight}px;`">
        <div class="nft-list">
          <div v-for="item in nfts" :key="item.id" class="nft-item">
            <!-- <div class="name">{{ item.id }} of {{ totalNft }} </div> -->
            <div class="meta">
              <div class="dna">#{{ item.id }}</div>
              <div class="action">
                <el-button size="small" :icon="Download" @click="saveNFT(item.dna)"
                  :loading="saveNFTState[ getDNAStr(item.dna) ]" />
              </div>
            </div>
            <div :class="{layers: true, 'twitter': twitterPfp}" :id="`nft-${getDNAStr(item.dna)}`">
              <img v-for="(comp, imgIdx) in components" :key="imgIdx"
                :style="`z-index: ${ 100 - imgIdx }`"
                :src="path + '/' + comp.materials[item.dna[imgIdx]].image" />
            </div>
          </div>
          <!-- For last row alignment -->
          <div v-for="(_, hidx) in emptyHolder" :key="hidx" class="nft-item empty">
          </div>
        </div>
      </div>
    </el-scrollbar>
    <HEX />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue';
import { Download } from '@element-plus/icons-vue';
import HEX from '../../assets/hex.svg';
import { IComponent, INft, Rank } from '../model/nft';
import { ElMessage } from 'element-plus';

interface IProps {
  components: IComponent[]
  path: string
  whiteList?: string[]
  output: string
  twitterPfp: boolean
}

const props = withDefaults(defineProps<IProps>(), {
  components: () => [],
  whiteList: () => [],
  path: '',
  output: '',
  twitterPfp: false,
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
const emptyHolder = computed(() => (new Array(cols - totalNft.value % cols).fill(null)))
// 编号计算
let nftMod: number[] = []
let nftMul: number[] = []
const getDNA = (index: number): number[] => {
  return nftMod.map((mod, idx) => Math.floor(index / nftMul[idx]) % mod)
}
const nfts = ref<INft[]>([])
const getDNAStr = (dna: number[]) => {
  return dna.map(item => ('00' + item.toString(16).toUpperCase()).slice(-2)).join('')
}

watchEffect(() => {
  nftMod = props.components.map(item => item.materials.length)
  nftMul = nftMod.map((item, idx) => {
    return idx === 0 ? 1 : nftMod.slice(0, idx).reduce((a, b) => a*b, 1)
  })
  const maxNFTCreate = 1000; // totalNft.value; // > 1000 ? 1000 : totalNft.value
  const nnfts: INft[] = new Array(maxNFTCreate).fill(0).map((_, idx) => ({
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

const saveNFTState = ref<{[prop: string]: boolean}>({})
const saveNFT = (dna: number[]) => {
  const dnaStr = getDNAStr(dna)
  const output = props.output + dnaStr + '.jpg'
  const sequency = props.components.map((comp, idx) => (props.path + '/' + comp.materials[dna[idx]].image))

  saveNFTState.value[dnaStr] = true
  window.monobroow.createNFT(output, sequency)
    .then(rst => {
      ElMessage.success('NFT 图片生成成功.')
    })
    .catch(err => {
      ElMessage.error(`${err.code}: ${err.message}`)
    })
    .finally(() => {
      saveNFTState.value[dnaStr] = false
    })
}
</script>

<style scoped lang="scss">
.nft-previewer {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.nft-list-wrapper {
  margin-right: -8px;
  margin-left: -8px;
}
.nft-list {
  margin: 0 auto;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

.nft-item {
  position: relative;
  width: 256px;
  height: 256px;
  margin: 8px;

  .meta {
    position: absolute;
    top: 8px;
    right: 8px;
    left: 8px;
    z-index: 100;
    pointer-events: none;
    display: flex;
    justify-content: space-between;
    opacity: 0;
    transition: all 0.25s;

    > * {
      pointer-events: all;
    }
  }

  .layers {
    width: 100%;
    height: 100%;
    position: relative;
    z-index: 0;
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
      height: calc(100%);
      width: calc(100%);
    }
  }

  &:hover {
    .meta {
      opacity: 1;
    }
  }

  &.empty {
    visibility: hidden;
  }

}
</style>
