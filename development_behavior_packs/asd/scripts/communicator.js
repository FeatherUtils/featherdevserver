import { system, world } from '@minecraft/server';
import * as net from '@minecraft/server-net';
import { http } from '@minecraft/server-net';
import { Router } from './ipc/router';
system.afterEvents.scriptEventReceive.subscribe(e => {
    if (e.id == "leaf:req2") {
        system.sendScriptEvent('leaf:req1', 'meow')
    }
})
system.waitTicks(0).then(() => {
    let router = new Router("LeafNetCli");
    // @ts-ignore
    router.registerListener("leafnet:req", async (payload) => {
        try {
            
            let data = JSON.parse(payload);
            // world.sendMessage(JSON.stringify(data))
            // console.log(data)
            // return "meow"
            let req = new net.HttpRequest(data.url);
            if (data.body)
                req.body = data.body
            // @ts-ignore
            req.method = data.method
            req.headers = [];
            if (data.headers) {
                for (const header of data.headers) {
                    console.log(JSON.stringify(header))
                    req.headers.push(new net.HttpHeader(header.key, header.value));
                }
            }
            if(!data.headers['Content-Type']) req.headers.push(new net.HttpHeader("Content-Type", "application/json"));
            let res = await http.request(req);
            return JSON.stringify([res.status, res.body.toString()]);
        }
        catch (e) {
            console.warn(e)
            console.warn(e.stack)
        }
        
    });
    // world.sendMessage("test")
    // let plugin = new Plugin("Meow!", "meow:meow", "TrashyDaFox")
    // plugin.initialize().then(async e=>{
    //     // let creations = await plugin.getCustomizerCreations()
    //     // world.sendMessage(typeof creations)
    //     // if(Array.isArray(creations)) {
    //     //     world.sendMessage(JSON.stringify(creations[Math.floor(Math.random() * creations.length)]))
    //     // }
    //     world.sendMessage(`Successfully initialized plugin! Key: ${e}`)
    // }).catch(e=>{
    //     world.sendMessage("didnt initialize plugin")
    // })
});