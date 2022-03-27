/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-empty */
import { ipcMain, dialog } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import type { NFTProjectObject, ProjectPaths } from '../../renderer/src/model/generator';
import { NFTProject } from '../../renderer/src/model/generator';
import { IPCResult } from '../../renderer/src/model/common';
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

    if (fs.existsSync(filename)) {
      const content = fs.readFileSync(filename, { encoding: 'utf-8' });
      try {
        proj.project = JSON.parse(content);
      } catch (err) {}
    } else {
      const matPath = projPath + '/' + paths.materialPath;
      if (!fs.existsSync(matPath)) {
        fs.mkdirSync(matPath);
      }
      const files = fs.readdirSync(matPath);

      const output = projPath + '/' + paths.nftPath;
      if (!fs.existsSync(output)) fs.mkdirSync(output);
      proj.filePaths = proj.filePaths.concat(files.filter(item => /\.png$/i.test(item)));

      const pname = <string>projPath.split('/').pop();
      const ppath = projPath;
      const images = proj.filePaths.slice(1);
      const project = new NFTProject(pname, ppath, images);
      proj.project = project.toJSON();
    }

    proj.filePaths[0] = projPath;
    if (!proj.project) {
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
      const gm = GM.subClass({imageMagick: true})
      sequency.reverse()
      let pipe = gm(<string>sequency.shift());
      console.log('load base')
      while (sequency.length) {
        pipe = pipe.draw(`image over 0,0 0,0 "${sequency.shift()}"`);
      }
      pipe.write(output, (err: any) => {
        if (err) {
          console.log(err)
          reject({
            message: '生成NFT时出错',
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
