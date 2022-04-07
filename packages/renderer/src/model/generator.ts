import { ElMessage } from 'element-plus';
import { componentSizes } from 'element-plus/es/constants';
import type { IComponent, IComponentGroup, IMaterial, INft } from './nft';

export interface INFTProjectStatus {
  group: string;
  bucket: INft[];
  twitterPfP: boolean;
}

export interface INFTProject {
  name: string;
  path: string;
  materialPath: string;
  nftPath: string;
  materials: IMaterial[];
  components: IComponent[];
  groups: IComponentGroup[];
  selected?: INft[];
  version?: string;

  status: INFTProjectStatus;

  componentsByGroup(group: string): IComponent[];
  updateComponentOrder(order: string[]): void;
  fromImages(images: string[]): void;
  getMaterial(code: number | string): IMaterial | undefined;
  getComponent(code: number | string): IComponent | undefined;
  getGroup(name: number | string): IComponentGroup | undefined;
  fromJSON(json: any): void;
  toObject(): NFTProjectObject;
}

export type NFTProjectObject = Pick<
  INFTProject,
  'version' | 'name' | 'path' | 'materialPath' | 'nftPath' | 'materials' | 'components' | 'groups' | 'selected' | 'status'
>;

export type ProjectPaths = {
  materialPath: string;
  nftPath: string;
};

const projectFromImages = (imageList: string[]): NFTProjectObject => {
  const comps: IComponent[] = [];
  const groups: IComponentGroup[] = [];

  const materials = imageList.map((image: string, matIndex: number) => {
    const parts = image.slice(0, -4).replace(/[-_]/g, '-').split('-');
    const material: IMaterial = {
      code: parts[0].toLowerCase().replace(/[^\w\d-_]+/g, '_'),
      displayName: parts[0].replace(/\b(\w)/g, _ => _.toUpperCase()),
      name: parts[0].toUpperCase(),
      image: image,
      component: parts[0].toLowerCase(),
      group: parts[1].toUpperCase(),
      ssr: /^ssr$/i.test(parts[3]),
      index: parseInt(parts[2]),
    };
    if (material.group === 'NA') material.group = '';

    let comp = comps.find(item => item.name === material.component);
    if (!comp) {
      comp = {
        displayName: material.component,
        name: material.component,
        code: material.component.toUpperCase(),
        materials: [],
        order: 0,
      };
      comps.push(comp);
    }
    comp.materials.push(matIndex);

    if (material.group) {
      let group = groups.find(item => item.name === material.group);
      if (!group) {
        groups.push({
          displayName: material.group,
          name: material.group,
          components: [],
        });
      }
    }

    return material;
  });

  const compList = comps.map(comp => comp.code);
  groups.forEach(group => {
    group.components = Array.from(compList);
  });

  return {
    name: '',
    path: '',
    materials: materials,
    materialPath: 'materials',
    nftPath: 'owesome',
    components: comps,
    groups,
    status: {
      group: '',
      bucket: [],
      twitterPfP: false,
    },
  };
};

const jsonProperties = ['version', 'name', 'path', 'materialPath', 'nftPath', 'materials', 'components', 'groups', 'selected', 'status'];
export class NFTProject implements INFTProject {
  static materialPath = 'materials';
  static nftPath = 'ntfs';

  name: string = '';
  path: string = '';
  materialPath: string = NFTProject.materialPath;
  nftPath: string = NFTProject.nftPath;
  materials: IMaterial[] = [];
  components: IComponent[] = [];
  groups: IComponentGroup[] = [];
  selected: INft[] = [];
  lastModifyDate: Date = new Date();
  version: string = '0.1.0';
  status: INFTProjectStatus = {
    group: '',
    bucket: [],
    twitterPfP: false,
  };

  constructor(name?: string, path?: string, images?: string[]) {
    if (name) this.name = name;
    if (path) this.path = path;
    if (images) this.fromImages(images);
  }

  fromImages(images: string[]) {
    const comps = projectFromImages(images);
    this.materials = comps.materials;
    this.groups = comps.groups;
    this.components = comps.components;
    this.lastModifyDate = new Date();
  }

  componentsByGroup(group: string): IComponent[] {
    const grp = this.groups.find(item => item.name === group)
    if (!grp) return [];

    return grp.components.map(compName => {
      const comp = this.getComponent(compName)
      const cpy: IComponent = JSON.parse(JSON.stringify(comp))
      return cpy;
    });
  }

  updateComponentOrder(order: string[]) {
    const comp = <IComponent[]>order.map(item => this.components.find(comp => comp.name === item)).filter(item => !!item);
    if (comp.length !== this.components.length) {
      throw new Error('Order sequence error.');
    }
    this.components = comp;
    this.lastModifyDate = new Date();
  }

  getMaterial(code: number | string): IMaterial | undefined {
    if (typeof code === 'number') {
      return this.materials[code];
    } else {
      return this.materials.find(item => item.code === code || item.name === code);
    }
  }

  getComponent(code: number | string): IComponent | undefined {
    if (typeof code === 'number') {
      return this.components[code]
    } else {
      return this.components.find(item => item.code === code || item.name === code);
    }
  }

  getGroup(name: number | string): IComponentGroup | undefined {
    if (typeof name === 'number') {
      return this.groups[name]
    } else {
      return this.groups.find(item => item.name === name)
    }
  }

  fromJSON(json: any) {
    let data: any;
    try {
      if (typeof json === 'string') {
        try {
          data = JSON.parse(json);
        } catch (err) {
          throw new Error('fromJSON() json data parse error.');
        }
      } else {
        data = json;
      }

      if (data) {
        const _this: any = this;
        jsonProperties.forEach((prop: string) => {
          if (data[prop]) {
            _this[prop] = data[prop];
          }
        });
      }

      if (this.groups && typeof this.groups[0] === 'string') {
        const complist: string[] = this.components ? this.components.map(item => item.name) : [];
        this.groups = this.groups.map(
          (item): IComponentGroup => ({
            displayName: item as unknown as string,
            name: item as unknown as string,
            components: (<string[]>[]).concat(complist),
          })
        );
      }

      this.lastModifyDate = new Date();
    } catch (err: any) {
      ElMessage.error(err.toString());
    }
  }

  toObject(): NFTProjectObject {
    const _this: any = this;
    const json: any = jsonProperties.reduce((a: any, b: any) => (a[b] = _this[b]) && a, {});
    return json;
  }
}
