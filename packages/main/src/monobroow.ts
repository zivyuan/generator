import {ipcMain, dialog} from 'electron';
import * as path from 'path';
import * as fs from 'fs';


// 选择项目
ipcMain.handle('openProject', async (event, projPath?: string) => {
  let proj: Electron.OpenDialogReturnValue = {
    canceled: false,
    filePaths: [projPath || ''],
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
    const projPath = stat.isFile() ? path.dirname(proj.filePaths[0]): proj.filePaths[0];
    proj.filePaths[0] = projPath;

    const matPath = projPath + '/materials';
    if (!fs.existsSync(matPath))
      fs.mkdirSync(matPath);
    const files = fs.readdirSync(matPath);

    // const output = projPath + '/owesome';
    // if (!fs.existsSync(output))
    //   fs.mkdirSync(output);
    proj.filePaths = proj.filePaths.concat(files.filter(item => (/\.png$/i).test(item)));
  }

  return proj;
});
