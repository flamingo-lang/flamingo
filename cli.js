const fs = require("fs");
const { spawnSync } = require("child_process");

const args = process.argv.slice(2);

const version = [0, 1, 0]

const usage = `flamingo@${version.join(".")}
Usage:
flamingo [command] [file]

Commands:

verify - Verifies the specified ALM file for internal consistency (requires Clingo)

`;

if (!args[0] || args[0] !== "verify") {
    console.log(usage);
    process.exit();
}

if (!args[1] || !fs.existsSync(args[1])) {
    console.log("Please specify a valid path to an ALM file.");
    process.exit();
}

console.log("Thinking...");

const file = fs.readFileSync(args[1], { encoding: "utf-8" });

console.log(spawnSync("clingo", { input: "a. b :- a. #false :- b.", encoding: "utf-8" }));