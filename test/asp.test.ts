import { readFileSync } from "fs";
import { printModule } from "../src/projection_printer";
import { parseModule } from "../src/parse";
import { writeFileSync } from "fs";
import { writeSync } from "clipboardy";

describe("Tau Parsing", () => {
    it("Should print todomvc", () => {
        const alm = parseModule(`
        module todomvc
        sorts
            todos :: 1..3
            filters :: { all, active, completed }

            new_todo :: actions
                attributes
                    new_text : strings
        fluents
            basic 
                next_todo : todos
        
                text : todos -> strings

                active : todos -> booleans

                active_filter : filters
            defined
                visible : todos -> booleans
        axioms
            occurs(A) causes
                text(Todo) = Text,
                next_todo = Todo + 1
            if
                instance(A, new_todo),
                new_text(A) = Text,
                next_todo = Todo.
   
            visible(Todo) if active(Todo), active_filter = all.
        initially
            next_todo = 1.
            active_filter = all.
       `);

        const asp = printModule(alm);
        writeFileSync("./prolog-test.lp", asp);
        writeSync(asp);
    });
});
            
