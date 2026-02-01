import { getHeldItem } from "./index";
import { CommandPermissionLevel, system, world, EntityComponentTypes, EquipmentSlot } from "@minecraft/server";

system.beforeEvents.startup.subscribe((e) => {
    let customCommandRegistry = e.customCommandRegistry;
    customCommandRegistry.registerCommand({
        name: "featherdynlight:lightconfig",
        description: "Open the configuration menu for Feather Dynamic Lighting",
        permissionLevel: CommandPermissionLevel.GameDirectors
    }, (origin) => {
        if (!origin.sourceEntity) return;
        system.run(() => {
            origin.sourceEntity.runCommand('scriptevent featherdynlight:config')
        })
    })
    customCommandRegistry.registerCommand({
        name: "featherdynlight:offhand",
        description: "Swap the held item to offhand",
        permissionLevel: CommandPermissionLevel.Any
    }, (origin) => {
        if (!origin.sourceEntity) return;
        if (origin.sourceEntity.typeId !== 'minecraft:player') return;
        system.run(() => {
            let player = origin.sourceEntity;
            let inventory = player.getComponent('inventory')
            let container = inventory.container
            let main = container.getItem(player.selectedSlotIndex)
            let mainSlot = container.getSlot(player.selectedSlotIndex)
            const equippable = player.getComponent(
                EntityComponentTypes.Equippable
            );
            const off = equippable.getEquipment(EquipmentSlot.Offhand);
            if(main) player.runCommand(`replaceitem entity @s slot.weapon.offhand 0 ${main.typeId} ${main.amount}`)
            if(off) { mainSlot.setItem(off), equippable.setEquipment(EquipmentSlot.Offhand) } else { mainSlot.setItem() }
        })
    })
})