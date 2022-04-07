/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-empty */
import { ipcMain, dialog } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import type { NFTProjectObject, ProjectPaths } from '../../renderer/src/model/generator';
import { NFTProject } from '../../renderer/src/model/generator';
import { IPCResult } from '../../renderer/src/model/common';
import { normalizeMaterials } from '../utils/normalizer';
import * as GM from 'gm';

type OpenProjectResult = Electron.OpenDialogReturnValue & {
  project?: NFTProjectObject;
};
// 选择项目
ipcMain.handle('openProject', async (event, projPath: string, paths: ProjectPaths) => {
  let proj: OpenProjectResult = {
    canceled: false,
    filePaths: [projPath || ''],
    project: undefined,
  };

  if (projPath && fs.existsSync(projPath)) {
    proj.canceled = false;
    proj.filePaths = [projPath];
  } else {
    proj = await dialog.showOpenDialog({
      properties: ['openFile', 'openDirectory'],
    });
  }

  if (!proj.canceled && proj.filePaths.length) {
    const stat = fs.statSync(proj.filePaths[0]);
    const projPath = stat.isFile() ? path.dirname(proj.filePaths[0]) : proj.filePaths[0];
    const filename = `${projPath}/generator.json`;
    const matPath = projPath + '/' + paths.materialPath;

    if (fs.existsSync(matPath)) {
      const arr = fs.readdirSync(matPath);
      const hasFolder = arr
        .map((item: string): number => {
          if (/^\./.test(item)) return 0;

          const fullpath = path.join(matPath, item);
          const stats = fs.statSync(fullpath);
          if (stats.isDirectory()) {
            return 1;
          } else {
            return 0;
          }
        })
        .reduce((a, b) => a + b, 0);
      if (hasFolder) {
        const matOri = matPath + '.orignal';
        if (fs.existsSync(matOri)) {
          fs.rmSync(matOri, { recursive: true });
        }
        fs.cpSync(matPath, matOri, { recursive: true });
        normalizeMaterials(matOri, matPath);
      }
    }

    if (fs.existsSync(filename)) {
      const content = fs.readFileSync(filename, { encoding: 'utf-8' });
      try {
        proj.project = JSON.parse(content);
      } catch (err) {
        proj.canceled = true;
      }
    } else {
      const output = projPath + '/' + paths.nftPath;

      if (!fs.existsSync(matPath)) fs.mkdirSync(matPath);
      if (!fs.existsSync(output)) fs.mkdirSync(output);
    }

    proj.filePaths = [projPath];
    if (!proj.canceled) {
      const files = fs.readdirSync(matPath).filter(item => /\.png$/i.test(item));
      const pname = <string>projPath.split('/').pop();
      const ppath = projPath;
      const project = new NFTProject(pname, ppath, files);
      if (proj.project) {
        // Update material list
      } else {
        // Initial project
        proj.project = project.toObject();
      }
      proj.filePaths = proj.filePaths.concat(files);
    } else {
      proj.canceled = true;
    }
  }

  return proj;
});

ipcMain.handle('saveProject', async (event, proj: NFTProjectObject) => {
  const filename = `${proj.path}/generator.json`;
  if (fs.existsSync(filename)) fs.writeFileSync(filename, JSON.stringify(proj, null, 2));
});

ipcMain.handle('createNFT', async (event, output: string, sequency: string[]): Promise<IPCResult<any>> => {
  return new Promise((resolve, reject) => {
    const checkFile = sequency.map(item => (fs.existsSync(item) ? item : '')).filter(item => !!item);
    if (checkFile.length) {
      reject({
        code: 1,
        message: '素材文件不存在. ' + checkFile,
        data: checkFile,
      });
      return;
    }

    try {
      const gm = GM.subClass({ imageMagick: true });
      sequency.reverse();
      let pipe = gm(<string>sequency.shift());
      while (sequency.length) {
        pipe = pipe.draw(`image over 0,0 0,0 "${sequency.shift()}"`);
      }
      pipe.write(output, (err: any) => {
        if (err) {
          console.log('生成 NFT 时出错. ' + err);
          reject({
            message: '生成 NFT 时出错',
            ...err,
            code: 2,
          });
        } else {
          resolve({
            code: 0,
            message: 'success',
          });
        }
      });
    } catch (err: any) {
      reject({
        code: 3,
        message: err.toString(),
      });
    }
  });
});
