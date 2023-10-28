import { IMaterial } from '../../renderer/src/model/nft';
import * as path from 'path';
import * as fs from 'fs';

const listFiles = (folder: string): string[] => {
  const base = folder.length;
  const files: string[] = [];

  const _walker = (folder: string) => {
    const arr = fs.readdirSync(folder);
    arr.forEach((item: string) => {
      if (/^\./.test(item)) return;

      const fullpath = path.join(folder, item);
      const stats = fs.statSync(fullpath);
      if (stats.isDirectory()) {
        _walker(fullpath);
      } else {
        files.push(fullpath.substr(base));
      }
    });
  };

  _walker(folder);

  return files;
};

/**
 * 以 {group}/{material.png} 的形式统一素材目录
 *
 * @param path material input path
 * @param output output path
 */
export const normalizeMaterials = (source: string, output: string) => {
  const files = listFiles(source);
  const components: {
    [comp: string]: IMaterial[];
  } = {};
  files.forEach((file: string) => {
    const parts = file.split('/');
    let compName = parts[1].split('_')[0].toLowerCase();
    if (compName === 'bg') compName = 'background';
    const filename = parts[2].replace(/^\d+_/, '');
    const comp = components[compName] || (components[compName] = []);
    const matProp = filename.split('_');
    const matName = compName.replace(/[_.]+/g, ' ').replace(/\b(\w)/g, _ => _.toUpperCase()) + ' ' + matProp[2];
    let group = matProp[1].toUpperCase();
    if (!/^[FM]$/i.test(group)) {
      group = 'NA';
    }
    comp.push({
      code: '',
      displayName: matName,
      // 默认为素材文件名
      name: compName,
      // 分组, 比如按性别区分等
      group,
      // 组件类别
      component: compName,
      // 是否SSR
      ssr: matProp[3] ? true : false,
      image: file,
      // 索引
      index: parseInt(matProp[2]),
      // 是否禁用
      disabled: false,
    });
  });

  if (fs.existsSync(output)) {
    fs.rmSync(output, { recursive: true });
  }
  fs.mkdirSync(output, { recursive: true });

  const compList = Object.keys(components);
  compList.forEach(compName => {
    const matList = components[compName];
    const compPath = output; //path.join(output, compName);
    if (!fs.existsSync(compPath)) {
      fs.mkdirSync(compPath, { recursive: true });
    }

    matList.forEach(mat => {
      const filename = [mat.component, mat.group, ('00' + mat.index).slice(-2), mat.ssr ? 'SSR' : ''].filter(item => !!item).join('-');
      const src = path.join(source, mat.image);
      const trg = path.join(compPath, filename + '.png');

      if (fs.existsSync(trg)) {
        fs.unlinkSync(trg);
      }
      fs.copyFileSync(src, trg);
    });
  });
};
