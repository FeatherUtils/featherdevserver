// let serverForm = require('./server_form.json')
const readline = require('readline');
const fs = require('fs');
const jsonc = require('jsonc-parser');
const serverForm = jsonc.parse(fs.readFileSync('server_form.json').toString())
// Create an interface for input and output
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to ask a question and get the answer
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function main() {
    const key = await askQuestion("What do you want theme key to be? ")
    const name = await askQuestion("What do you want the theme name to be? ")
    const path = await askQuestion("What is the theme path? ")
    if(!key || !name || !path) return;
    const newPath = `textures/example/${path}`;
    let thing = [key, name, newPath]
    console.log(JSON.stringify(thing))
    const newThing = name.toLowerCase().replace(/ /g, '_')
    serverForm["advanced_button@starlib_pkg_button_templates.horizontal_button_template"].$BUTTON_STYLE_default_variable_controls.push({
		[`${newThing}_default@starlib_pkg_button_style.style_variable`]: {
			"texture": newPath,
			"$key": `§a§l§t§b§t§n${key}` //Key to switch style
		}
	})
    serverForm[`header_${newThing}@style.image`] = {
        "texture": newPath
    }
    serverForm.header.controls.push({
        [`${newThing}@global.title_binding`]: {
            "$key": `§t§h§e§m§0§1${key}`,
            "$control": `server_form.header_${newThing}`
        }
    })
    fs.writeFileSync('server_form.json', JSON.stringify(serverForm, null, 4))
    console.log("!!! Added theme")
    process.exit(1)
}

main()