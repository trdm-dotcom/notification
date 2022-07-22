import Config from '../Config';
import {readFileSync} from 'fs';
import { Logger } from 'common';
import * as ejs from 'ejs';
const dirTemplate =  Config.app.template.dir;

export function getTemplate(name: string, localeString: string, data: Object){
    try {
        let template = ejs.compile(readFileSync(`${dirTemplate}name`, 'utf8'),{localsName: localeString});
        return template(data);   
    } catch (error: any) {
        Logger.error(error);
        return null;
    }
}