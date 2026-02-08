import { world, system } from '@minecraft/server';
import communication from './communication';
import { http, HttpRequest, HttpRequestMethod, HttpHeader } from '@minecraft/server-net';

system.run(async () => {
    await system.waitTicks(10)
    system.sendScriptEvent('networking:bdslayerinstalled', 'yes')
})

communication.register('networking:requestBDS', async ({ args }) => {
    const responseID = args[0]
    const requestData = JSON.parse(args.splice(1).join(' '))
    if (typeof responseID !== 'string') return console.warn('[FeatherNetworkingBDSLayer] Received invalid responseID from networking');
    if (typeof requestData !== 'object') return console.warn('[FeatherNetworkingBDSLayer] Received invalid request data from networking');
    if (isNaN(+responseID)) return console.warn('[FeatherNetworkingBDSLayer] Received invalid responseID from networking');
    let req = new HttpRequest(requestData.url)
    req.setMethod(requestData.method)
    req.setTimeout(requestData.timeout || 60)
    if (requestData.body) req.setBody(requestData.body)
    if (requestData.headers && Array.isArray(requestData.headers)) {
        for (const header of requestData.headers) {
            if (header.key && header.value) {
                req.addHeader(header.key, header.value)
            }
        }
    }
    const res = await http.request(req)

    system.sendScriptEvent(
        'networking:responseBDS:' + responseID,
        JSON.stringify({
            status: res.status,
            body: res.body,
            headers: res.headers
        })
    )
})