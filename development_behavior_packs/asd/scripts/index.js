import { world, system } from '@minecraft/server'

let button = {text:`communication test`,subtext:`test`,icon:`.azalea/1`,actions:['say hi']}

system.run(async () => {
    let dim = world.getDimension('minecraft:overworld')
    let btn = JSON.stringify(button)
    await system.waitTicks(10)
    console.log(btn)
    // dim.runCommand(`scriptevent feather:pushToConfig ${btn}`)
})