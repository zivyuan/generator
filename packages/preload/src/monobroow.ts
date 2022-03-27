import { exposeInMainWorld } from './exposeInMainWorld';
import { ipcRenderer } from 'electron';
import type { NFTProjectObject, ProjectPaths } from '../../renderer/src/model/generator';

// Export for types in contracts.d.ts
export const monobroow = {
  openProject: async (
    proj: string,
    paths: ProjectPaths,
  ) => {
    return ipcRenderer.invoke('openProject', proj, paths);
  },
  //
  saveProject: async (proj: NFTProjectObject) => {
    return ipcRenderer.invoke('saveProject', proj);
  },
  //
  createNFT: async (output: string, sequency: string[]) => {
    return ipcRenderer.invoke('createNFT', output, sequency);
  },
};

exposeInMainWorld('monobroow', monobroow);
