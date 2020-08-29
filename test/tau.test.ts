import { create } from "tau-prolog";
import { readFileSync } from "fs";
import { printModule } from "../src/projection_printer";
import { parseModule } from "../src/parse";

describe("Tau Parsing", () => {
    it("Should work on the static file", () => {
        const logic = readFileSync("./test/prolog-projection.lp", { encoding: "utf-8" });
        const s = create();
        const parseResult = s.consult(logic);
        if (parseResult !== true) {
            throw new Error(parseResult.toString());
        }
    });

    it("Should print todomvc", () => {
        const alm = parseModule(`
        module todomvc
        sorts
            todos :: integers
            special_todos :: 1..10, todos
            todo_state :: { complete, incomplete }
        `);

        const logic = printModule(alm);
        console.log(logic);
        const s = create();
        const parseResult = s.consult(logic);
        if (parseResult !== true) {
            throw new Error(parseResult.toString());
        }
    });
});