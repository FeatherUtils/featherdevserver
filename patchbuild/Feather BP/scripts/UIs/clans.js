import uiManager from "../Libraries/uiManager";
import config from "../config";
import { ModalFormData } from "@minecraft/server-ui";
import { ActionForm } from "../Libraries/form_func";
import { consts } from "../cherryUIConsts";
import clans from "../Modules/clans";
import playerStorage from "../Libraries/playerStorage";

uiManager.addUI(config.uinames.clans.root, 'clans root', (player) => {
    let id = playerStorage.getID(player)
    let clan = clans.getFromPlayerID(id)

    let form = new ActionForm();
    form.title(`${consts.tag}Clans`)
    if (clan) {
        let role = clan.data.members.find(_ => _.id == id).role
        form.button(`§cLeave\n§7Leave this clan`, `.azalea/2`, (player) => {
            clans.leave(id)
            return uiManager.open(player, config.uinames.clans.root)
        })
        form.button(`§bMembers\n§7View all players in clan`, `.azalea/8-old`, (player) => {
            uiManager.open(player, config.uinames.clans.viewMembers)
        })
        form.button(`§6Bank\n§7Contribute to the Clan Bank`, `.feather/bank`, (player) => {
            uiManager.open(player, config.uinames.clans.bank)
        })
        if (role > 1) {
            let invites = clans.inviteDB.findDocuments({ plrID: id, type: 'Request' })
            form.button(`§aJoin Requests\n§7View join requests for clan`, `.azalea/RequestIncoming`, (player) => {
                let form2 = new ActionForm();
                form2.title(`${consts.tag}Join Requests`)
                form2.button(`${consts.header}§cBack\n§7Go back to clans UI`, (player) => {
                    uiManager.open(player, config.uinames.clans.root)
                })
                for (const invite of invites) {
                    let plr = playerStorage.getPlayerByID(invite.data.plrID)
                    if (!plr) continue;
                    form2.button(`§6${plr.name}\n§7View request`, `.azalea/RequestIncoming`, (player) => {
                        let form3 = new ActionForm();
                        form3.title(`${consts.tag}Clan Request`)
                        form3.button(`§aAccept`, '.azalea/4-a', (player) => {
                            clans.acceptReq(invite.id)
                            uiManager.open(player, config.uinames.clans.root)
                        })
                        form3.button(`§cDecline`, `.azalea/Delete`, (player) => {
                            clans.decline(invite.id)
                            uiManager.open(player, config.uinames.clans.root)
                        })
                        form3.show(player)
                    })
                }
                form2.show(player)
            })
        }
    } else {
        form.button(`§aCreate\n§7Create a clan`, `.azalea/1`, (player) => {
            uiManager.open(player, config.uinames.clans.create);
        })
        let invites = clans.inviteDB.findDocuments({ plrID: id, type: 'Invite' })
        form.button(`§6Invites\n§7View clan invites (${invites.length})`, `.azalea/request`, (player) => {
            let form2 = new ActionForm();
            form2.title(`${consts.tag}Clan Invites`)
            form2.button(`${consts.header}§cBack\n§7Go back to clans UI`, (player) => {
                uiManager.open(player, config.uinames.clans.root)
            })
            for (const invite of invites) {
                let clan2 = clans.get(invite.data.clanID)
                if (!clan2) continue;
                form2.button(`§6${clan2.data.name}\n§7View invite`, `.azalea/RequestIncoming`, (player) => {
                    let form3 = new ActionForm();
                    form3.title(`${consts.tag}Clan Invite`)
                    form3.button(`§aAccept`, '.azalea/4-a', (player) => {
                        clans.acceptInv(invite.id)
                        uiManager.open(player, config.uinames.clans.root)
                    })
                    form3.button(`§cDecline`, `.azalea/Delete`, (player) => {
                        clans.decline(invite.id)
                        uiManager.open(player, config.uinames.clans.root)
                    })
                    form3.show(player)
                })
            }
            form2.show(player)
        })
        form.button(`§bPublic Clans\n§7View and request to join public clans`, `.azalea/WarpEditor`, (player) => {
            uiManager.open(player, config.uinames.clans.public)
        })
    }
    form.show(player)
})

uiManager.addUI(config.uinames.clans.create, 'clans create', (player) => {
    let form = new ModalFormData();
    form.title('Create Clan')
    form.textField('Name', 'Example: Diamond')
    form.toggle(`Public`, { tooltip: 'Whether your clan can be discovered publicly', defaultValue: true })
    form.show(player).then((res) => {
        let [name, ispublic] = res.formValues
        if(name.length > 12) return player.error('Can not make clan name more than 12 letters long');
        if(!name) return player.error(`No name found`)
        clans.addClan(player, name, ispublic)
    })
})