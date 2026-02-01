import { system, world, ItemStack } from '@minecraft/server'
import { ModalFormData } from '@minecraft/server-ui'
import communication from './communication';
import heart from './api/heart';
import './startup'
import { prismarineDb } from './lib/prismarinedb';
import dead from './api/dead';
import { ActionForm } from './lib/form_func'
import players from './api/players';
let featherInstalled = false;
let featherVersion = null;

system.run(async () => {
    await system.waitTicks(10)
    system.sendScriptEvent('feather:lifestealInstalled', 'v0.1')
    if (!world.getDynamicProperty('maxHearts')) world.setDynamicProperty('maxHearts', 20)
    if (!world.getDynamicProperty('heartsAfterRevive')) world.setDynamicProperty('heartsAfterRevive', 10)
})

communication.register('featherlifesteal:verifyFeatherInstalled', ({ args }) => {
    featherInstalled = true;
    featherVersion = args[0];
    console.log('[Lifesteal] Verified Feather installed, version: ' + featherVersion)
})
system.afterEvents.scriptEventReceive.subscribe((e) => {
    if (!e.sourceEntity) return;
    let player = e.sourceEntity
    let clearHOL = false;
    if (player.typeId !== 'minecraft:player') return;
    if (e.id !== 'featherlifesteal:revive') return;
    if (e.message == 'HOL') clearHOL = true
    let form = new ActionForm();
    form.title('Revive')
    for (const d of dead.db.findDocuments()) {
        let plr = players.get(d.data.id)
        if (d.data.scheduledRevive) continue;
        if (!plr) continue;
        form.button(`§b${plr.name}`, null, (player) => {
            dead.revive(d.data.id)
            player.sendMessage(`§aRevived ${plr.name}!`)
            player.playSound('random.orb')
            if (clearHOL) player.runCommand('clear @s featherlifesteal:apple_of_life 0 1')
        })
    }
    form.show(player)
})
system.afterEvents.scriptEventReceive.subscribe((e) => {
    if (!e.sourceEntity) return;
    let player = e.sourceEntity
    if (player.typeId !== 'minecraft:player') return;
    if (e.id !== 'featherlifesteal:config') return;
    let form = new ModalFormData();
    form.title('Feather Lifesteal Configuration')
    form.slider('Max Hearts', 10, 50, { defaultValue: world.getDynamicProperty('maxHearts') })
    form.slider('Hearts after Revive', 1, 20, { defaultValue: world.getDynamicProperty('heartsAfterRevive') })
    form.show(player).then((res) => {
        let [mh, har] = res.formValues;
        world.setDynamicProperty('maxHearts', mh)
        world.setDynamicProperty('heartsAfterRevive', har)
        if (featherInstalled) {
            player.runCommand('feather:config')
        }
        player.sendMessage('§aSuccessfully updated configuration')
    })
})
function getObjective(obj) {
    if (world.scoreboard.getObjective(obj)) {
        return world.scoreboard.getObjective(obj);
    } else {
        return world.scoreboard.addObjective(obj)
    }
}

system.runInterval(() => {
    let hearts = getObjective('featherlifesteal:hearts')
    world.getPlayers().forEach((player) => {
        if (!hearts.getScore(player)) hearts.setScore(player, 10)
        if (hearts.getScore(player) > world.getDynamicProperty('maxHearts')) hearts.setScore(player, world.getDynamicProperty('maxHearts'))
        let score = hearts.getScore(player)
        heart.setHearts(player, score)
    })
}, 2)

world.beforeEvents.itemUse.subscribe((e) => {
    system.run(() => {
        if (e.itemStack.typeId !== 'featherlifesteal:heart') return;
        let hearts = getObjective('featherlifesteal:hearts')
        if (hearts.getScore(e.source) + 1 > world.getDynamicProperty('maxHearts')) return e.source.sendMessage('§cYou are at the maximum hearts limit!')
        hearts.addScore(e.source, 1)
        e.source.runCommand('clear @s featherlifesteal:heart 0 1')
        e.source.sendMessage('§aSuccessfully redeemed heart')
    })
})
world.beforeEvents.itemUse.subscribe((e) => {
    system.run(() => {
        if(e.itemStack.typeId !== 'featherlifesteal:apple_of_life') return;
        e.source.runCommand('scriptevent featherlifesteal:revive HOL')
    })
})
world.afterEvents.entityDie.subscribe((e) => {
    if (e.deadEntity.typeId !== 'minecraft:player') return;
    let hearts = getObjective('featherlifesteal:hearts')
    let player = e.deadEntity
    if (
        e.damageSource &&
        e.damageSource.damagingEntity &&
        e.damageSource.damagingEntity.typeId === 'minecraft:player' &&
        world.getDynamicProperty('maxHearts') <
        hearts.getScore(e.damageSource.damagingEntity)
    ) {
        let damagingEntity = e.damageSource.damagingEntity
        hearts.setScore(damagingEntity, hearts.getScore(damagingEntity) + 1)
        damagingEntity.sendMessage('§aGained 1 heart by killing ' + e.deadEntity.name)
        hearts.setScore(e.deadEntity, hearts.getScore(e.deadEntity) - 1)
        e.deadEntity.sendMessage('§cYou lost 1 heart by dying to ' + damagingEntity.name)
        if (hearts.getScore(player.scoreboardIdentity) < 1) {
            dead.addDeath(player.id)
            if (player.playerPermissionLevel >= 2) {
                hearts.setScore(player, world.getDynamicProperty('heartsAfterRevive'))
                dead.reviveInstantly(player.id)
                player.sendMessage('§aYou were automatically revived due to your Operator status on the server.')
                player.playSound('random.orb')
                return;
            }
            player.runCommand(`kick "${player.name}" "§cLife§aSteal §8>> §cYou are dead!\n§cIf you have a friend on the server, ask them to try to revive you!\n"`)
        }
    } else {
        let heart = new ItemStack('featherlifesteal:heart')
        e.deadEntity.dimension.spawnItem(heart, e.deadEntity.location)
        hearts.setScore(e.deadEntity, hearts.getScore(e.deadEntity) - 1)
        e.deadEntity.sendMessage('§cYou lost 1 heart by dying!')
        if (hearts.getScore(player.scoreboardIdentity) < 1) {
            dead.addDeath(player.id)
            if (player.playerPermissionLevel >= 2) {
                hearts.setScore(player, world.getDynamicProperty('heartsAfterRevive'))
                dead.reviveInstantly(player.id)
                player.sendMessage('§aYou were automatically revived due to your Operator status on the server.')
                player.playSound('random.orb')
                return;
            }
            player.runCommand(`kick "${player.name}" "§cLife§aSteal §8>> §cYou are dead!\n§cIf you have a friend on the server, ask them to try to revive you!\n"`)
        }
    }
})

world.afterEvents.playerSpawn.subscribe((e) => {
    if (!e.initialSpawn) return;
    let hearts = getObjective('featherlifesteal:hearts')
    let d = dead.db.findFirst({ id: e.player.id })
    if (d) {
        if (e.player.playerPermissionLevel >= 2) {
            hearts.setScore(e.player, world.getDynamicProperty('heartsAfterRevive'))
            dead.db.deleteDocumentByID(d.id)
            e.player.sendMessage('§aYou were automatically revived due to your Operator status on the server.')
            e.player.playSound('random.orb')
            return;
        }
        if (d.data.scheduledRevive) {
            dead.db.deleteDocumentByID(d.id)
            e.player.sendMessage('§aYou were revived! Welcome back.')
            e.player.playSound('random.orb')
            hearts.setScore(e.player, world.getDynamicProperty('heartsAfterRevive'))
            return;
        }
        e.player.runCommand(`kick "${e.player.name}" "§cLife§aSteal §8>> §cYou are dead!\n§cIf you have a friend on the server, ask them to try to revive you!\n"`)
    }
})
export { featherInstalled, featherVersion, getObjective }