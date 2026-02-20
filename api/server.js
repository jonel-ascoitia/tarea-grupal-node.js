import { buildApp } from '../src/app.js';

let appInstance = null;

export default async function handler(req, res) {
    if (!appInstance) {
        appInstance = await buildApp();
        await appInstance.ready();
    }

    appInstance.server.emit('request', req, res);
}
