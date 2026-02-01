// src/index.js
import { world as world2, system as system3, EntityComponentTypes as EntityComponentTypes2, EquipmentSlot as EquipmentSlot2 } from "@minecraft/server";

// src/communication.js
import { system } from "@minecraft/server";
var Communication = class {
  constructor() {
    this.registeredCommunications = /* @__PURE__ */ new Map();
    system.afterEvents.scriptEventReceive.subscribe((event) => {
      const { id, message, sourceEntity } = event;
      const cb = this.registeredCommunications.get(id);
      if (!cb) return;
      try {
        cb({
          args: this.parseArgs(message || ""),
          player: sourceEntity?.typeId === "minecraft:player" ? sourceEntity : null,
          rawMessage: message
        });
      } catch (err) {
        console.error(`Error in communication callback for "${id}":`, err);
      }
    });
  }
  register(id, callback) {
    if (typeof callback !== "function") {
      throw new Error("Callback must be a function");
    }
    this.registeredCommunications.set(id, callback);
  }
  unregister(id) {
    this.registeredCommunications.delete(id);
  }
  parseArgs(str) {
    const args = [];
    let i = 0;
    while (i < str.length) {
      if (str[i] === '"') {
        let end = ++i;
        let value = "";
        while (end < str.length) {
          if (str[end] === '"' && str[end - 1] !== "\\") break;
          value += str[end++];
        }
        args.push(value);
        i = end + 1;
      } else if (str[i] === "{" || str[i] === "[") {
        let startChar = str[i];
        let endChar = startChar === "{" ? "}" : "]";
        let depth = 0;
        let value = "";
        while (i < str.length) {
          if (str[i] === startChar) depth++;
          if (str[i] === endChar) depth--;
          value += str[i];
          i++;
          if (depth === 0) break;
        }
        args.push(value);
      } else if (/\s/.test(str[i])) {
        i++;
      } else {
        let value = "";
        while (i < str.length && !/\s/.test(str[i])) {
          value += str[i++];
        }
        args.push(value);
      }
    }
    return args;
  }
};
var communication_default = new Communication();

// src/startup.js
import { CommandPermissionLevel, system as system2, world, EntityComponentTypes, EquipmentSlot } from "@minecraft/server";
system2.beforeEvents.startup.subscribe((e) => {
  let customCommandRegistry = e.customCommandRegistry;
  customCommandRegistry.registerCommand({
    name: "featherdynlight:lightconfig",
    description: "Open the configuration menu for Feather Dynamic Lighting",
    permissionLevel: CommandPermissionLevel.GameDirectors
  }, (origin) => {
    if (!origin.sourceEntity) return;
    system2.run(() => {
      origin.sourceEntity.runCommand("scriptevent featherdynlight:config");
    });
  });
  customCommandRegistry.registerCommand({
    name: "featherdynlight:offhand",
    description: "Swap the held item to offhand",
    permissionLevel: CommandPermissionLevel.Any
  }, (origin) => {
    if (!origin.sourceEntity) return;
    if (origin.sourceEntity.typeId !== "minecraft:player") return;
    system2.run(() => {
      let player = origin.sourceEntity;
      let inventory = player.getComponent("inventory");
      let container = inventory.container;
      let main = container.getItem(player.selectedSlotIndex);
      let mainSlot = container.getSlot(player.selectedSlotIndex);
      const equippable = player.getComponent(
        EntityComponentTypes.Equippable
      );
      const off = equippable.getEquipment(EquipmentSlot.Offhand);
      if (main) player.runCommand(`replaceitem entity @s slot.weapon.offhand 0 ${main.typeId} ${main.amount}`);
      if (off) {
        mainSlot.setItem(off), equippable.setEquipment(EquipmentSlot.Offhand);
      } else {
        mainSlot.setItem();
      }
    });
  });
});

// src/index.js
import { ModalFormData } from "@minecraft/server-ui";
var button = { text: "Feather Dynamic Lighting", subtext: "Open feather dynamic lighting config", icon: ".azalea/3", permission: "dynamicLighting", actions: ["scriptevent featherdynlight:config"] };
var featherInstalled = false;
var featherVersion = null;
function gp(prop) {
  return world2.getDynamicProperty(prop);
}
system3.run(async () => {
  let b = JSON.stringify(button);
  await system3.waitTicks(10);
  system3.sendScriptEvent("feather:pushToConfig", `${b}`);
  console.log("Send push to config scriptevent");
  if (!gp("torchLightLevel")) world2.setDynamicProperty("torchLightLevel", 9);
  if (!gp("soulTorchLightLevel")) world2.setDynamicProperty("soulTorchLightLevel", 6);
  if (!gp("lanternLightLevel")) world2.setDynamicProperty("lanternLightLevel", 15);
  if (!gp("redstoneTorchLightLevel")) world2.setDynamicProperty("redstoneTorchLightLevel", 4);
  if (!gp("soulLanternLightLevel")) world2.setDynamicProperty("soulLanternLightLevel", 10);
});
communication_default.register("feather:isInstalled", ({ args }) => {
  featherInstalled = true;
  featherVersion = args[0];
  console.log("[Dynamic Lighting] Feather is installed, version: " + featherVersion);
});
function setp(prop, val) {
  world2.setDynamicProperty(prop, val);
}
system3.afterEvents.scriptEventReceive.subscribe((e) => {
  if (e.id !== "featherdynlight:config") return;
  if (!e.sourceEntity) return console.log("No entity");
  if (e.sourceEntity.typeId !== "minecraft:player") return console.log("Not player");
  let form = new ModalFormData();
  form.title("Feather Dynamic Lighting");
  form.slider("Torch light level", 1, 15, { defaultValue: world2.getDynamicProperty("torchLightLevel") });
  form.slider("Soul Torch light level", 1, 15, { defaultValue: world2.getDynamicProperty("soulTorchLightLevel") });
  form.slider("Lantern light level", 1, 15, { defaultValue: world2.getDynamicProperty("lanternLightLevel") });
  form.slider("Redstone Torch light level", 1, 15, { defaultValue: world2.getDynamicProperty("redstoneTorchLightLevel") });
  form.slider("Soul lantern light level", 1, 15, { defaultValue: world2.getDynamicProperty("soulLanternLightLevel") });
  form.show(e.sourceEntity).then((res) => {
    let [t, st, l, rt, sl] = res.formValues;
    setp("torchLightLevel", t);
    setp("soulTorchLightLevel", st);
    setp("lanternLightLevel", l);
    setp("redstoneTorchLightLevel", rt);
    setp("soulLanternLightLevel", sl);
    e.sourceEntity.sendMessage("\xA7aSet configuration successfully!");
  });
});
var LightBlocks = /* @__PURE__ */ new Map();
world2.beforeEvents.playerLeave.subscribe((e) => {
  system3.run(() => {
    let b = LightBlocks.get(e.player.id);
    if (b) {
      e.player.runCommand(`setblock ${b.loc.x} ${b.loc.y} ${b.loc.z} air`);
      LightBlocks.delete(e.player.id);
    }
  });
});
function getHeldItem(player) {
  const invComp = player.getComponent("minecraft:inventory");
  const equippable = player.getComponent(
    EntityComponentTypes2.Equippable
  );
  if (equippable) {
    const off = equippable.getEquipment(EquipmentSlot2.Offhand);
    if (off) return off;
  }
  if (!invComp || !invComp.container) return null;
  const container = invComp.container;
  const index = player.selectedSlotIndex;
  return container.getItem(index) ?? null;
}
system3.runInterval(() => {
  world2.getPlayers().forEach((player) => {
    let plrLoc = { x: Math.floor(player.location.x), y: Math.floor(player.location.y), z: Math.floor(player.location.z) };
    let b = LightBlocks.get(player.id);
    let h = getHeldItem(player);
    if (b) {
      if (b.loc.x !== plrLoc.x || b.loc.y !== plrLoc.y || b.loc.z !== plrLoc.z || h.typeId !== b.item) {
        player.runCommand(`setblock ${b.loc.x} ${b.loc.y} ${b.loc.z} air`);
        LightBlocks.delete(player.id);
      }
    }
    if (h && h.typeId === "minecraft:torch") {
      const px = Math.floor(player.location.x);
      const py = Math.floor(player.location.y);
      const pz = Math.floor(player.location.z);
      let block = player.dimension.getBlock(player.location);
      if (block.isAir) LightBlocks.set(player.id, { loc: { x: px, y: py, z: pz }, item: h.typeId });
      player.runCommand(
        `fill ${px} ${py} ${pz} ${px} ${py} ${pz} minecraft:light_block_${gp("torchLightLevel")} replace air`
      );
    }
    if (h && h.typeId === "minecraft:lantern") {
      const px = Math.floor(player.location.x);
      const py = Math.floor(player.location.y);
      const pz = Math.floor(player.location.z);
      let block = player.dimension.getBlock(player.location);
      if (block.isAir) LightBlocks.set(player.id, { loc: { x: px, y: py, z: pz }, item: h.typeId });
      player.runCommand(
        `fill ${px} ${py} ${pz} ${px} ${py} ${pz} minecraft:light_block_${gp("lanternLightLevel")} replace air`
      );
    }
    if (h && h.typeId === "minecraft:soul_torch") {
      const px = Math.floor(player.location.x);
      const py = Math.floor(player.location.y);
      const pz = Math.floor(player.location.z);
      let block = player.dimension.getBlock(player.location);
      if (block.isAir) LightBlocks.set(player.id, { loc: { x: px, y: py, z: pz }, item: h.typeId });
      player.runCommand(
        `fill ${px} ${py} ${pz} ${px} ${py} ${pz} minecraft:light_block_${gp("soulTorchLightLevel")} replace air`
      );
    }
    if (h && h.typeId === "minecraft:soul_lantern") {
      const px = Math.floor(player.location.x);
      const py = Math.floor(player.location.y);
      const pz = Math.floor(player.location.z);
      let block = player.dimension.getBlock(player.location);
      if (block.isAir) LightBlocks.set(player.id, { loc: { x: px, y: py, z: pz }, item: h.typeId });
      player.runCommand(
        `fill ${px} ${py} ${pz} ${px} ${py} ${pz} minecraft:light_block_${gp("soulLanternLightLevel")} replace air`
      );
    }
    if (h && h.typeId === "minecraft:redstone_torch") {
      const px = Math.floor(player.location.x);
      const py = Math.floor(player.location.y);
      const pz = Math.floor(player.location.z);
      let block = player.dimension.getBlock(player.location);
      if (block.isAir) LightBlocks.set(player.id, { loc: { x: px, y: py, z: pz }, item: h.typeId });
      player.runCommand(
        `fill ${px} ${py} ${pz} ${px} ${py} ${pz} minecraft:light_block_${gp("soulLanternLightLevel")} replace air`
      );
    }
  });
}, 2);
system3.beforeEvents.shutdown.subscribe((e) => {
  system3.run(() => {
    world2.getPlayers().forEach((player) => {
      let b = LightBlocks.get(player.id);
      if (b) {
        player.runCommand(`setblock ${b.loc.x} ${b.loc.y} ${b.loc.z} air`);
        LightBlocks.delete(player.id);
      }
    });
  });
});
export {
  featherInstalled,
  featherVersion,
  getHeldItem
};
