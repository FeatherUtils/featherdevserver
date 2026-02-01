import { world,system } from '@minecraft/server'

class HeartAPI {
    setHearts(player,hearts) {
        system.run(() => {
            player.runCommand('event entity @s lifesteal:health-' + hearts)
        })
    }
}

export default new HeartAPI()