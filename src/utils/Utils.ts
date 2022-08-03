import Config from '../Config';
import { Logger } from 'common';
import { Liquid } from 'liquidjs';
const dirTemplate = Config.app.template.dir;

export function getTemplate(name: string, data: Object): string {
    try {
        if (name.endsWith('.html')) {
            let engine = new Liquid({
                root: dirTemplate,
                extname: '.html',
            });
            return engine.renderFileSync(name, data);
        } else {
            let engine = new Liquid({
                root: dirTemplate,
                extname: '.liquid',
            });
            return engine.renderFileSync(name, data);
        }
    } catch (error: any) {
        Logger.error(error);
        return null;
    }
}
