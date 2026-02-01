import * as mc from '@minecraft/server'

class WorldPersistentStorage {
    constructor() { }
    load(collection) {
        mc.system.run(() => {
            let val;
            try {
                val = mc.world.getDynamicProperty(`_FEATHERCOLLECTION:${collection}`);
            } catch {
                val = ``;
            }
            if (!val) val = `[]`;
            let data = [];
            try {
                data = JSON.parse(val);
            } catch {
                data = [];
            }
            return data;
        })

    }
    save(collection, data) {
        mc.system.run(() => {
            mc.world.setDynamicProperty(`_FEATHERCOLLECTION:${collection}`, JSON.stringify(data))
            return true;
        })
    }
}
export default new WorldPersistentStorage()