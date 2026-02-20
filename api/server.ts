import { buildApp } from '../src/app';

let appInstance: any = null;

export default async (req: any, res: any) => {
    if (!appInstance) {
        appInstance = await buildApp();
        await appInstance.ready();
    }

    appInstance.server.emit('request', req, res);
};
