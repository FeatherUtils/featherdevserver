import { world, system, EntityComponentTypes, EquipmentSlot } from '@minecraft/server'
import communication from './communication'
import './startup'
import { ModalFormData } from '@minecraft/server-ui'

let button = { text: 'Feather Dynamic Lighting', subtext: 'Open feather dynamic lighting config', icon: '.azalea/3', permission: 'dynamicLighting', actions: ['scriptevent featherdynlight:config'] }

let featherInstalled = false;
let featherVersion = null;
function gp(prop) {
    return world.getDynamicProperty(prop);
}

system.run(async () => {
    let b = JSON.stringify(button)
    await system.waitTicks(10)
    system.sendScriptEvent('feather:pushToConfig', `${b}`)
    console.log('Send push to config scriptevent')
    if (!gp('torchLightLevel')) world.setDynamicProperty('torchLightLevel', 9)
    if (!gp('soulTorchLightLevel')) world.setDynamicProperty('soulTorchLightLevel', 6)
    if (!gp('lanternLightLevel')) world.setDynamicProperty('lanternLightLevel', 15)
    if (!gp('redstoneTorchLightLevel')) world.setDynamicProperty('redstoneTorchLightLevel', 4)
    if (!gp('soulLanternLightLevel')) world.setDynamicProperty('soulLanternLightLevel', 10)
})

communication.register('feather:isInstalled', ({ args }) => {
    featherInstalled = true;
    featherVersion = args[0]
    console.log('[Dynamic Lighting] Feather is installed, version: ' + featherVersion)
})
function setp(prop, val) {
    world.setDynamicProperty(prop, val)
}

system.afterEvents.scriptEventReceive.subscribe((e) => {
    if (e.id !== 'featherdynlight:config') return;
    if (!e.sourceEntity) return console.log('No entity');
    if (e.sourceEntity.typeId !== 'minecraft:player') return console.log('Not player');
    let form = new ModalFormData()
    form.title('Feather Dynamic Lighting')
    form.slider('Torch light level', 1, 15, { defaultValue: world.getDynamicProperty('torchLightLevel') })
    form.slider('Soul Torch light level', 1, 15, { defaultValue: world.getDynamicProperty('soulTorchLightLevel') })
    form.slider('Lantern light level', 1, 15, { defaultValue: world.getDynamicProperty('lanternLightLevel') })
    form.slider('Redstone Torch light level', 1, 15, { defaultValue: world.getDynamicProperty('redstoneTorchLightLevel') })
    form.slider('Soul lantern light level', 1, 15, { defaultValue: world.getDynamicProperty('soulLanternLightLevel') })
    form.show(e.sourceEntity).then((res) => {
        let [t, st, l, rt, sl] = res.formValues;
        setp('torchLightLevel', t)
        setp('soulTorchLightLevel', st)
        setp('lanternLightLevel', l)
        setp('redstoneTorchLightLevel', rt)
        setp('soulLanternLightLevel', sl)
        e.sourceEntity.sendMessage('§aSet configuration successfully!')
    })
})

let LightBlocks = new Map();

world.beforeEvents.playerLeave.subscribe((e) => {
    system.run(() => {
        let b = LightBlocks.get(e.player.id)
        if (b) {
            e.player.runCommand(`setblock ${b.loc.x} ${b.loc.y} ${b.loc.z} air`)
            LightBlocks.delete(e.player.id)
        }
    })

})

function getHeldItem(player) {
    const invComp = player.getComponent("minecraft:inventory");
    const equippable = player.getComponent(
        EntityComponentTypes.Equippable
    );

    if (equippable) {
        const off = equippable.getEquipment(EquipmentSlot.Offhand);
        if (off) return off;
    }

    if (!invComp || !invComp.container) return null;
    const container = invComp.container;
    const index = player.selectedSlotIndex;
    return container.getItem(index) ?? null;
}

system.runInterval(() => {
    world.getPlayers().forEach((player) => {
        let plrLoc = { x: Math.floor(player.location.x), y: Math.floor(player.location.y), z: Math.floor(player.location.z) }
        let b = LightBlocks.get(player.id)
        let h = getHeldItem(player)
        if (b) {
            if (b.loc.x !== plrLoc.x || b.loc.y !== plrLoc.y || b.loc.z !== plrLoc.z || h.typeId !== b.item) {
                player.runCommand(`setblock ${b.loc.x} ${b.loc.y} ${b.loc.z} air`)
                LightBlocks.delete(player.id)
            }
        }


        if (h && h.typeId === 'minecraft:torch') {
            const px = Math.floor(player.location.x)
            const py = Math.floor(player.location.y)
            const pz = Math.floor(player.location.z)

            let block = player.dimension.getBlock(player.location)

            if (block.isAir) LightBlocks.set(player.id, { loc: { x: px, y: py, z: pz }, item: h.typeId });

            player.runCommand(
                `fill ${px} ${py} ${pz} ${px} ${py} ${pz} minecraft:light_block_${gp('torchLightLevel')} replace air`
            )
        }
        if (h && h.typeId === 'minecraft:lantern') {
            const px = Math.floor(player.location.x)
            const py = Math.floor(player.location.y)
            const pz = Math.floor(player.location.z)

            let block = player.dimension.getBlock(player.location)

            if (block.isAir) LightBlocks.set(player.id, { loc: { x: px, y: py, z: pz }, item: h.typeId });

            player.runCommand(
                `fill ${px} ${py} ${pz} ${px} ${py} ${pz} minecraft:light_block_${gp('lanternLightLevel')} replace air`
            )
        }
        if (h && h.typeId === 'minecraft:soul_torch') {
            const px = Math.floor(player.location.x)
            const py = Math.floor(player.location.y)
            const pz = Math.floor(player.location.z)

            let block = player.dimension.getBlock(player.location)

            if (block.isAir) LightBlocks.set(player.id, { loc: { x: px, y: py, z: pz }, item: h.typeId });

            player.runCommand(
                `fill ${px} ${py} ${pz} ${px} ${py} ${pz} minecraft:light_block_${gp('soulTorchLightLevel')} replace air`
            )
        }
        if (h && h.typeId === 'minecraft:soul_lantern') {
            const px = Math.floor(player.location.x)
            const py = Math.floor(player.location.y)
            const pz = Math.floor(player.location.z)

            let block = player.dimension.getBlock(player.location)

            if (block.isAir) LightBlocks.set(player.id, { loc: { x: px, y: py, z: pz }, item: h.typeId });

            player.runCommand(
                `fill ${px} ${py} ${pz} ${px} ${py} ${pz} minecraft:light_block_${gp('soulLanternLightLevel')} replace air`
            )
        }
        if (h && h.typeId === 'minecraft:redstone_torch') {
            const px = Math.floor(player.location.x)
            const py = Math.floor(player.location.y)
            const pz = Math.floor(player.location.z)

            let block = player.dimension.getBlock(player.location)

            if (block.isAir) LightBlocks.set(player.id, { loc: { x: px, y: py, z: pz }, item: h.typeId });

            player.runCommand(
                `fill ${px} ${py} ${pz} ${px} ${py} ${pz} minecraft:light_block_${gp('soulLanternLightLevel')} replace air`
            )
        }
    })
}, 2)

system.beforeEvents.shutdown.subscribe((e) => {
    system.run(() => {
        world.getPlayers().forEach((player) => {
            let b = LightBlocks.get(player.id)
            if (b) {
                player.runCommand(`setblock ${b.loc.x} ${b.loc.y} ${b.loc.z} air`)
                LightBlocks.delete(player.id)
            }
        })
    })
})

export { getHeldItem, featherInstalled, featherVersion }