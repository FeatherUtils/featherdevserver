import { world, system } from '@minecraft/server'
import { SegmentedStoragePrismarine } from '../lib/segmentedstorageprismarine'
import { prismarineDb } from '../lib/prismarinedb'
import { getObjective } from '../index'

class Players {
    constructor() {
        system.run(async () => {
            this.db = prismarineDb.customStorage('Lifesteal:Players', SegmentedStoragePrismarine)
            this.kv = await this.db.keyval('Players')
            this.a();
        })
    }
    a() {
        system.runInterval(() => {
            world.getPlayers().forEach((player) => {
                this.save(player)
            })
        }, 2)
    }
    save(player) {
        let scores = []
        for (const objective of world.scoreboard.getObjectives()) {
            let obj = getObjective(objective.id)
            let score = obj.getScore(player)
            if (score == null) continue;
            scores.push({ objective: objective.id, score });
        }
        let tags = player.getTags()
        this.kv.set(player.id, {
            tags,
            scores,
            id: player.id,
            name: player.name,
            nametag: player.nameTag,
            location: {
                x: player.location.x,
                y: player.location.y,
                z: player.location.z
            },
        })
    }
    get(id) {
        return this.kv.get(id)
    }
    search(name) {
        let ids = [];
        for (const key of this.keyval.keys()) {
            if (name == "") {
                ids.push(key);
                continue;
            }
            let data = this.kv.get(key);
            if (this.parseName(data.name).includes(this.parseName(name)))
                ids.push(key);
        }
        return ids;
    }
}

export default new Players();