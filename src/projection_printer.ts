import { ModuleAST, Sorts, Statics, Fluents, FunctionDecl } from "./parse";
import { unpad } from "./unpad";


export function printSortNames(sorts: Sorts) {
    return sorts.value.map(({ first, second }) =>
        first.map(({ value: firstSortName }) => [
            `sort(${firstSortName}).`,
            second.map((secondSortName) => {
                if (Array.isArray(secondSortName)) {
                    // Range case
                    return unpad(`
                        holds(static(link(${firstSortName}), integers)).
                        dom(${firstSortName}, ${secondSortName[0]}..${secondSortName[1]}).
                        `);
                } else if ("name" in secondSortName) {
                    // Identifier Case
                    return unpad(`
                        holds(static(link(${firstSortName}), ${secondSortName.value})).
                        `);
                } else {
                    // Set literal case
                    const arr = Array.from(secondSortName).map(({ value }) => value);
                    return unpad(`
                        dom(${firstSortName},(${arr.join(";")})).
                        `);
                }
            }),
        ])).flat(Infinity).join("\n");
}

export function printAttributes({ value: sorts }: Sorts) {
    return sorts.map(({ first, attributes }) =>
        first.map(({ value: firstSortName }) =>
            attributes === null ? "" : attributes.map(({ value: { ident: { value: ident }, args, ret } }) => {
                if (args) {
                    const sort_var_combos = [firstSortName, ...args.map(x => x.value)]
                        .map((ident, i) => [ident, `S${i}`]);
                    const vars = sort_var_combos.map(([_, x]) => x);
                    const doms = sort_var_combos.map(([s, x]) => `dom(${s}, ${x})`).join(", ");
                    return unpad(`
                    attr(${ident}(${vars.join(",")}), Ret) :- ${doms}, dom(${ret.value}, Ret).
                    `);
                } else {
                    return unpad(`
                        attr(${ident}(X), Ret) :- dom(${firstSortName}, X), dom(${ret.value}, Ret).
                        `);
                }
            })
        ),
    ).flat(Infinity).join("\n");
}

export function printStatics({ value: statics }: Statics) {
    return statics.map(({ value: { ident: { value: ident }, args, ret } }) => {
        if (args) {
            const sort_var_combos = args.map(x => x.value)
                .map((ident, i) => [ident, `S${i}`]);
            const vars = sort_var_combos.map(([_, x]) => x);
            const doms = sort_var_combos.map(([s, x]) => `dom(${s}, ${x})`).join(", ");
            return unpad(`
                static(${ident}(${vars.join(", ")}), Ret) :- ${doms}, dom(${ret.value}, Ret).
                `);
        } else {
            return unpad(`
                static(${ident}, Ret) :- dom(${ret.value}, Ret).
                `);
        }
    }).flat(Infinity).join("\n");
}

export function printFluents({ basic, defined }: Fluents) {
    const fluentPrinter = (basicOrDefined: string) =>
        ({ value: { ident: { value: ident }, args, ret } }: FunctionDecl) => {
            if (args) {
                const sort_var_combos = args.map(x => x.value)
                    .map((ident, i) => [ident, `S${i}`]);
                const vars = sort_var_combos.map(([_, x]) => x);
                const doms = sort_var_combos.map(([s, x]) => `dom(${s}, ${x})`).join(", ");
                return unpad(`
                    fluent(${basicOrDefined}, ${ident}(${vars.join(", ")}), Ret) :- ${doms}, dom(${ret.value}, Ret).
                    `);
            } else {
                return unpad(`
                    fluent(${basicOrDefined}, ${ident}, Ret) :- dom(${ret.value}, Ret).
                    `);
            }
        };
    return [
        basic?.value.map(fluentPrinter("basic")) ?? [],
        defined?.value.map(fluentPrinter("defined")) ?? [],
    ].flat(Infinity).join("\n");
}

// export function printProjection(mod: ModuleAST) {

//     attributes === null ? "" : (...attributes!.map(attr => ""))
//     const rules = [
//         "dom(Ret, X) :- subsort(S, Ret), dom(S, X).",
//         printSortNames(mod.sorts),

//     ];
// }