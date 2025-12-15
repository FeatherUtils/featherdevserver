const fs = require('fs');
let data = [];
fs.readdir('./', (err, files)=>{
    for(const file of files) {
        if(!file.endsWith('.png')) continue;
        let extensionRemoved = file.slice(0,-4);
        data.push([extensionRemoved, `textures/feather_icons/${extensionRemoved}`])
        let code = `import icons from "../Modules/icons";
        
    let iconPack = new Map([
    ["pack_name", "Feather"],
    ["pack_icon", "pack_icon.png"],
    ["pack_namespace", "feather"],
    ["pack_data", new Map(${JSON.stringify(data, null, 2)})]
]);
icons.install(iconPack)
export { iconPack }`;
        fs.writeFileSync('code.js', code);
    }
})