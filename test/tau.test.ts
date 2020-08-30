import Pl from "../src/tau-prolog";
import { readFileSync } from "fs";
import { printModule } from "../src/projection_printer";
import { parseModule } from "../src/parse";
import { writeFileSync } from "fs";

describe("Tau Parsing", () => {
    it("Should work on the static file", () => {
        const logic = readFileSync("./test/prolog-projection.lp", { encoding: "utf-8" });
        const s = Pl.create();
        const parseResult = s.consult(logic);
        if (parseResult !== true) {
            throw new Error(parseResult.toString());
        }
    });

    it("Should print todomvc", () => {
        const alm = parseModule(`
        module todomvc
        sorts
            todos :: 1..3
            todo_state :: { complete, incomplete }
            filters :: { all, active, completed }

            new_todo :: actions
                attributes
                    text : string

            todo_action :: actions
                attributes
                    target : todos
            toggle_todo :: todo_action
            destroy_todo :: todo_action
            edit_todo :: todo_action
                attributes
                    text : string

            set_all :: actions
                attributes
                    state: todo_state
            clear_completed :: actions
            set_active_filter :: actions
                attributes
                    filter : filters
        statics
            complement : booleans -> booleans
        fluents
            basic 
                next_todo : todos
        
                destroyed : todos -> booleans
        
                text : todos -> strings

                active : todos -> booleans

                completed : todos -> booleans

                active_filter : filters
            defined
                visible : todos -> booleans
        axioms
            complement(true) = false.
            complement(false) = true.
    
            occurs(A) causes
                text(Todo) = Text,
                completed(Todo) = false,
                next_todo = Todo + 1
            if
                instance(A, new_todo),
                text(A) = Text,
                next_todo = Todo.
   
            occurs(A) causes completed(Todo) if
                instance(A, toggle_all),
                state(A) = complete.

            occurs(A) causes -completed(Todo) if
                instance(A, toggle_all),
                state(A) = incomplete.

            occurs(A) causes completed(Todo) = Comp if
                instance(A, toggle_todo),
                target(A) = Todo,
                completed(Todo) = Completed,
                complement(Completed) = Comp.
    
            occurs(A) causes text(Todo) = Text if
                instance(A, edit_todo),
                target(A) = Todo,
                text(A) = Text.
    
            occurs(A) causes destroyed(Todo) if
                instance(A, clear_completed),
                completed(Todo).

            occurs(A) causes active_filter = F if
                instance(A, set_active_filter),
                filter(A) = F.

            visible(Todo) if active_filter = all.
 
        initially
            next_todo = 1.
            active_filter = all.
        `);

        const logic = printModule(alm);
        writeFileSync("./prolog-test.lp", logic);
        const s = Pl.create();
        const parseResult = s.consult(logic);
        if (parseResult !== true) {
            throw new Error(parseResult.toString());
        }
    });
});
            // visible(Todo) if completed(Todo), active_filter = completed.
            // visible(Todo) if -completed(Todo), active_filter = active.
