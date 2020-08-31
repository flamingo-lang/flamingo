import { ALM, FunctionLiteral, parseModule } from "./parse";
import { pLimit } from "./pLimit";
import { getVariablesFromFnLit, isVariable, printModule, printQuery } from "./projection_printer";
import { writeSync } from "clipboardy";
const limit = pLimit(1);

export interface ClingoResult {
  Solver: string,
  Calls: number,
  Call: { Witnesses: { Value: string[] }[] }[],
  Models: { More: "yes" | "no", Number: number },
  Result: "SATISFIABLE" | "UNSATISFIABLE",
  Time: {
    CPU: number,
    Model: number,
    Solve: number,
    Total: number,
    Unsat: number,
  }
}

export type FlamingoValue = string | boolean | number;

export type FlamingoQueryResult = Record<string, FlamingoValue>[];

export type FlamingoAction = [string, Record<string, FlamingoValue>];

export const makeSession = (run: (program: string, models?: number, options?: string) => Promise<ClingoResult>, logic: string) => {
  const program = printModule(parseModule(logic))
  return (
    queries: string[],
    history: FlamingoAction[],
  ): Promise<Map<string,FlamingoQueryResult>> => limit(async () => {
    const queryASP = queries.map((query) => {
      const parsed = ALM.Query.tryParse(query) as FunctionLiteral[];
      const variables = parsed.flatMap(getVariablesFromFnLit)
        .flatMap(({ ret, args }) => {
          return [
            ...ret ?? [],
            ...args?.flat(Infinity).filter(isVariable) ?? []
          ]
        }).map(x => x.value).join(",");
      return `#show ("${query}", "${variables}",${variables}) : ${printQuery(query)}`;
    }).join("\n");
    const history_str = history.map(([action, attributes], i) => {
      const name = `${action}${i}`;
      const attrs = (() => {
        const ret: string[] = [];
        for (const k in attributes) {
          const v = attributes[k];
          ret.push(`holds(static(${k}(${name}), ${v})).`);
        }
        return ret.join("\n");
      })();
      return `
      dom(${action}, ${name}).
      ${attrs}
      occurs(${name}, ${i}).`;
    }).join("\n");
    
    const asp = `
    #const n = ${history.length}.
    ${program}
    ${history_str}
    ${queryASP}`;
    writeSync(asp);
    const results = await run(asp, 1, `--const n=${history.length}`);
    const answers = results.Call[0].Witnesses[0].Value;
    const ret: Map<string, FlamingoQueryResult> = new Map();
    for (const ans of answers) {
      const [q, rest] = ans.slice(0, -1).split('","');
      const [vars0, vals0] = rest.split("\",");
      if (q === "Duplicate values found") {
        throw new Error(ans);
      }
      const vars = vars0.split(",");
      const vals = vals0.split(',');
      console.log("vars", vars);
      console.log("vals", vals);
      console.log("q", q);
      const res = vars.reduce((prev, curr, i) => {
        const v = vals[i];
        const parsedVal = (() => {
          if (v === "true" || v === "false") {
            return Boolean(v);
          } else if (!Number.isNaN(Number(v))) {
            return Number(v);
          } else {
            return v;
          }
        })();
        prev[curr] = parsedVal;
        return prev;
      }, {} as Record<string, FlamingoValue>);
      
      const qq = q.slice(2);
      if (ret.has(qq)) {
        ret.set(qq, [...ret.get(qq),  res])
      } else {
        ret.set(qq, [res]);
      }
    }
    return ret;
  });
}
