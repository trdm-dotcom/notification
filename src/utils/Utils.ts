import { Logger } from 'common';
import Config from '../Config';
import { Liquid } from 'liquidjs';
const path = require('path');

export async function getTemplate(name: string, data: Object): Promise<string | null> {
  try {
    const rootDir: string = `${path.resolve(__dirname, Config.app.template.dir)}`;
    if (name.endsWith('.html')) {
      let engine = new Liquid({
        root: rootDir,
        extname: '.html',
      });
      return await engine.renderFile(name, data);
    } else {
      let engine = new Liquid({
        root: rootDir,
        extname: '.liquid',
      });
      return await engine.renderFile(name, data);
    }
  } catch (error: any) {
    Logger.error(`getTemplate error`, error);
    return null;
  }
}
