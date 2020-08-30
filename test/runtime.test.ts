import Tau from "../src/tau-prolog";
import { runQuery, createSession, dispatch } from "../src/runtime";
import { expect } from "chai";

const logic = `
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
            active_filter = all.`;
            
describe("Runtime", () => {
    it("Query", async () => {
        const session = createSession(logic);
        
        const query = "visible(Todo), next_todo = Next."
        expect((await runQuery(session, query)).Todo).to.have.members([1, 2, 3]);
        expect((await runQuery(session, query)).Next).to.equal(1);
    });

    it("Querying concurrently works", async () => {
        const session = createSession(logic);
        return Promise.all([
            runQuery(session, "visible(Todo).")
                .then(x => expect(x.Todo).to.have.members([1, 2, 3])),
            runQuery(session, "next_todo = Next.")
                .then(x => expect(x.Next).to.equal(1))
        ]);
    });

    it("Dispatch", async () => {
        const session = createSession(logic);
        await dispatch(session, "set_active_filter", { filter: "completed" });
        const result1 = await runQuery(session, "active_filter = Active.");
        expect(result1.Active).to.equal("completed");
        const result2 = await runQuery(session, "visible(Todo).");
        expect(result2.Todo).to.be.undefined;
    });
});
