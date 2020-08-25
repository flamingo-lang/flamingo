import { ModuleAST, Sorts, Statics } from "./parse";
import { unpad } from "./unpad";


export function printSortNames(sorts: Sorts) {
    return sorts.value.map(({ first, second }) =>
        first.map(({ value: firstSortName }) => [
            `sort(${firstSortName}).`,
            second.map((secondSortName) => {
                if (Array.isArray(secondSortName)) {
                    // Range case
                    return unpad(`
                        subsort(${firstSortName}, range(${secondSortName[0], secondSortName[1]})).
                        dom(${firstSortName}, ${secondSortName[0]}..${secondSortName[1]}).
                        `);
                } else if ("name" in secondSortName) {
                    // Identifier Case
                    return unpad(`
                        subsort(${firstSortName}, ident(${secondSortName.value})).
                        `);
                } else {
                    // Set literal case
                    const arr = Array.from(secondSortName).map(({ value }) => value);
                    return unpad(`
                        subsort(${firstSortName}, set((${arr.join(",")}))).
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
                    const params = sort_var_combos.map(([s, _], i) => `param(${ident}, ${i}, ${s}).`).join(" ");
                    return unpad(`
                    is_attr(${ident}).
                    attr(${ident}(${vars.join(",")}, S')) :- ${doms}, dom(${ret.value}, S').
                    ${params}
                    ret(${ident}, ${ret.value}).
                    `);
                } else {
                    return unpad(`
                    is_attr(${ident}).
                    attr(${ident}(X, S')) :- dom(${firstSortName}, X), dom(${ret.value}, S').
                    param(${ident}, 0, ${firstSortName}).
                    ret(${ident}, ${ret.value}).
                    `);
                }
            })
        ),
    ).flat(Infinity).join("\n");
}

export function printStatics({ value: sorts }: Statics) {
    return sorts.map(({ value: { ident, args, ret } }) => {
        if (args) {
            const sort_var_combos = args.map(x => x.value)
                .map((ident, i) => [ident, `S${i}`]);
            const vars = sort_var_combos.map(([_, x]) => x);
            const doms = sort_var_combos.map(([s, x]) => `dom(${s}, ${x})`).join(", ");
            const params = sort_var_combos.map(([s, _], i) => `param(${ident}, ${i}, ${s}).`).join(" ");
            return unpad(`
                is_attr(${ident}).
                attr(${ident}(${vars.join(",")})) :- ${doms}.
                ${params}
                ret(${ident}, ${ret.value}).
                `);
        } else {
            return unpad(`
                is_attr(${ident}).
                attr(${ident}).
                ret(${ident}, ${ret.value}).
                `);
        }
    }).flat(Infinity).join("\n");
}
// export function printProjection(mod: ModuleAST) {

//     attributes === null ? "" : (...attributes!.map(attr => ""))
//     const rules = [
//         "dom(S', X) :- subsort(S, S'), dom(S, X).",
//         printSortNames(mod.sorts),

//     ];
// }