
/**
 * 素材
 * 素材文件名
 * {component}-{group}-[{SSR}]-{index}.png
 */
export interface IMaterial {
  displayName: string
  // 默认为素材文件名
  name: string
  // 分组, 比如按性别区分等
  group: string
  // 组件类别
  component: string
  // 是否SSR
  ssr: boolean
  image: string
  // 索引
  index: number
  // 是否禁用
  disabled?: boolean
}

/**
 * NFT 组件
 */
export interface IComponent {
  displayName: string
  name: string
  code: string
  materials: IMaterial[]
  order: number
  thumb?: string
}

export interface IComponentGroup {
  displayName: string
  name: string
  components: string[]
}

export enum Rank {
  Normal = 1,
  Silver,
  Gold,
}

export interface INft {
  id: number
  layers: IMaterial[]
  // {IMaterial.group}{...IMaterial.code}
  dna: number[]
  hash: string
  ssr: boolean
  rank: Rank
  props?: object
}
