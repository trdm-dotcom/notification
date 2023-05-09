import Config from '../Config';
import { Liquid } from 'liquidjs';

export function getTemplate(name: string, data: Object): string {
  try {
    if (name.endsWith('.html')) {
      let engine = new Liquid({
        root: Config.app.template.dir,
        extname: '.html',
      });
      return engine.renderFileSync(name, data);
    } else {
      let engine = new Liquid({
        root: Config.app.template.dir,
        extname: '.liquid',
      });
      return engine.renderFileSync(name, data);
    }
  } catch (error: any) {
    return null;
  }
}
