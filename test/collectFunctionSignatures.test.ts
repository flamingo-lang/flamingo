import { expect } from "chai";
import { collectFunctionSignatures } from "../src/collectFunctionSignatures";
import { parseModule } from "../src/parse";

describe("collectFunctionSignatures", () => {
    it("Should work", () => {
        const mod1 = parseModule(`
        module foo_bar
        sorts
            todos :: integers
            todo_state :: { complete, incomplete }
            filters :: { all, active, completed }
            new_todo :: actions
                attributes
                    text : string
        statics
            complement : booleans -> booleans
        fluents
            basic 
                next_todo : todos
                destroyed : todos -> booleans
        
        defined
        visible : todos -> booleans 
        `);
        expect(collectFunctionSignatures(mod1)).to.deep.equal({
            text: { args: ['new_todo'], ret: 'string' },
            complement: { args: ['booleans'], ret: 'booleans' },
            next_todo: { args: [], ret: 'todos' },
            destroyed: { args: ['todos'], ret: 'booleans' },
            visible: { args: ['todos'], ret: 'booleans' }
        });

        const mod2 = parseModule(`
        module foo_bar
        statics
            complement : booleans -> booleans
        fluents
            basic 
                next_todo : todos
                destroyed : todos -> booleans
        
        defined
        visible : todos -> booleans 
        `);
        expect(collectFunctionSignatures(mod2)).to.deep.equal({
            complement: { args: ['booleans'], ret: 'booleans' },
            next_todo: { args: [], ret: 'todos' },
            destroyed: { args: ['todos'], ret: 'booleans' },
            visible: { args: ['todos'], ret: 'booleans' }
        });
    });
})