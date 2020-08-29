import { ModuleAST, Sorts, Statics, Fluents } from "./parse";

export function collectAttributeSignatures(x: Sorts | null) {
    const m: Record<string, { args?: string[], ret: string }> = {};
    if (x) {
        const { value: sorts } = x;
        for (const { first, attributes } of sorts) {
            for (const { value: firstSortName } of first) {
                if (attributes) {
                    for (const { value: { ident: { value: ident }, args, ret } } of attributes) {
                        m[ident] = {
                            args: [firstSortName, ...args?.map(x => x.value) ?? []],
                            ret: ret.value
                        }
                    }
                }
            }
        }
    }
    return m;
}

export function collectStaticSignatures(x: Statics | null) {
    const m: Record<string, { args?: string[], ret: string }> = {};
    if (x) {
        const { value: statics } = x;
        for (const { value: { ident: { value: ident }, args, ret } } of statics) {
            m[ident] = {
                args: args?.map(x => x.value) ?? [],
                ret: ret.value
            }
        }
    }
    return m;
}

export function collectFluentSignatures(x: Fluents | null) {
    const m: Record<string, { args?: string[], ret: string }> = {};
    if (x) {
        const { basic, defined } = x;
        const fluents = [
            ...basic?.value ?? [],
            ...defined?.value ?? []
        ];
        for (const { value: { ident: { value: ident }, args, ret } } of fluents) {
            m[ident] = {
                args: args?.map(x => x.value) ?? [],
                ret: ret.value
            }
        }

    }
    return m;
}

export function collectFunctionSignatures(mod: ModuleAST) {
    return {
        ...collectAttributeSignatures(mod.sorts),
        ...collectStaticSignatures(mod.statics),
        ...collectFluentSignatures(mod.fluents),
    };
}
