import { exposeInMainWorld } from './exposeInMainWorld';
import { dialog } from 'electron';
import { ipcRenderer } from 'electron';

// Export for types in contracts.d.ts
export const monobroow = {
  openProject: async (proj?: string) => {
    // console.log('.dialog', dialog);
    // return dialog.showOpenDialog({
    //   properties: ['openFile', 'openDirectory'],
    // });
    return ipcRenderer.invoke('openProject', proj);
  },
  listFiles: async () => {
    return dialog.showOpenDialogSync({
      properties: ['openFile', 'openDirectory'],
    });
  },
};

exposeInMainWorld('monobroow', monobroow);
