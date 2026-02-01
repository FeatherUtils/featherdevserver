import { system, world, CustomCommandParamType, ItemStack, CommandPermissionLevel } from '@minecraft/server'
import { getObjective } from './index'

system.beforeEvents.startup.subscribe((e) => {
    let customCommandRegistry = e.customCommandRegistry
    customCommandRegistry.registerCommand({
        name: 'featherlifesteal:withdraw',
        description: 'Withdraw a heart',
        mandatoryParameters: [{ name: 'amount', type: CustomCommandParamType.Integer }],
        permissionLevel: CommandPermissionLevel.Any
    }, (origin, amount) => {
        system.run(() => {
            if (origin.sourceEntity.typeId !== 'minecraft:player') return;
            let player = origin.sourceEntity
            let hearts = getObjective('featherlifesteal:hearts')
            if (1 > hearts.getScore(player) - amount) return player.sendMessage('§cYou dont have enough hearts');
            hearts.setScore(player, hearts.getScore(player) - amount)
            let heart = new ItemStack('featherlifesteal:heart', amount)
            let inventory = player.getComponent('inventory')
            let container = inventory.container
            container.addItem(heart)
            player.sendMessage('§aSuccessfully withdrew ' + amount + ' heart')
        })
    })
    customCommandRegistry.registerCommand({
        name: 'featherlifesteal:lifestealconfig',
        description: 'Configuration for lifesteal',
        permissionLevel: CommandPermissionLevel.GameDirectors
    }, (origin) => {
        if(origin.sourceEntity.typeId !== 'minecraft:player') return;
        let player = origin.sourceEntity;
        system.run(() => {
            player.runCommand('scriptevent featherlifesteal:config')
        })
    })
    customCommandRegistry.registerCommand({
        name: 'featherlifesteal:revive',
        description: 'Revive players to allow them to join back',
        permissionLevel: CommandPermissionLevel.GameDirectors
    }, (origin) => {
        if(origin.sourceEntity.typeId !== 'minecraft:player') return;
        let player = origin.sourceEntity;
        system.run(() => {
            player.runCommand('scriptevent featherlifesteal:revive')
        })
    })
})