import { prismarineDb } from "../lib/prismarinedb";
import { system } from '@minecraft/server'
import { SegmentedStoragePrismarine } from "../lib/segmentedstorageprismarine";
import players from "./players";

class Dead {
    constructor() {
        system.run(() => {
            this.db = prismarineDb.customStorage('Lifesteal:Dead', SegmentedStoragePrismarine)
        })
    }
    addDeath(id) {
        this.db.insertDocument({
            id,
            scheduledRevive: false
        })
        return true;
    }
    revive(id) {
        let d = this.db.findFirst({id})
        if(!d) return false;
        d.data.scheduledRevive = true
        this.db.overwriteDataByID(d.id,d.data)
        return true;
    }
    reviveInstantly(id) {
        let d = this.db.findFirst({id})
        if(!d) return false
        this.db.deleteDocumentByID(d.id)
        return true;
    }
}
export default new Dead();