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

export const makeSession = (run: (program: string, models?: number, options?: string) => Promise<ClingoResult>, logic: string) => {
  const program = printModule(parseModule(logic))
  return (
    queries: string[],
    history: [string, Record<string, FlamingoValue>][],
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
    console.log(answers);
    const ret: Map<string, FlamingoQueryResult> = new Map();
    for (const ans of answers) {
      const [q, vars, ...vals] = ans.slice(1, -1)
        .replace('"', "")
        .split(",");
      const res = vars.split(",").reduce((prev, curr, i) => {
        const v = vals[i];
        const k = curr.slice(1, -1);
        const parsedVal = (() => {
          if (v === "true" || v === "false") {
            return Boolean(v);
          } else if (!Number.isNaN(Number(v))) {
            return Number(v);
          } else {
            return v;
          }
        })();
        prev[k] = parsedVal;
        return prev;
      }, {} as Record<string, FlamingoValue>);

      const qq = q.slice(0, -1);
      if (ret.has(qq)) {
        ret.set(qq, [...ret.get(qq),  res])
      } else {
        ret.set(qq, [res]);
      }
    }
    return ret;
  });
}



// export type FlamingoSession = { runtime: ReturnType<typeof Pl.create>; n: number };


// let session: FlamingoSession;
// let n: number;
// export const createSession = (logic: string): void => {
//   session = { runtime: Pl.create(), n: 0 };
//   const translatedModule = printModule(parseModule(logic));
//   session.runtime.consult(translatedModule);
// };

// export const runQuery = (
//   query: string
// ): Promise<FlamingoQueryResult> => {
//   return limit(
//     async () => {
//       const translatedQuery = printQuery(session.n, query);

//       const answers: Record<string, number | string>[] = await session.runtime.query_all(translatedQuery);
//       return answers.reduce((prev, curr) => {
//         for (const k in curr) {
//           const v = curr[k];
//           const val = (v === "true" || v === "false") ? Boolean(v) : v;

          
//         }
//         return prev;
//       }, {} as FlamingoQueryResult);
//     });
// };

// export const dispatch = (
//   action: string,
//   attributes: Record<string, FlamingoValue>
// ): Promise<void> => {
//   return limit(async () => {
//     const name = `${action}${session.n}`;
//     // const attrs = Object.keys(attributes);
//     const attrs = (() => {
//       const ret: string[] = [];
//       for (const k in attributes) {
//         if (Object.prototype.hasOwnProperty.call(attributes, k)) {
//           const v = attributes[k];
//           ret.push(`assertz(holds(static(${k}(${name}), ${v}))).`);
//         }
//       }
//       return ret.join("\n");
//     })();

//     const assertz = `
//     assertz(dom(${action}, ${name})).
//     ${attrs}
//     assertz(occurs(${name}, ${session.n})).`;

//     await session.runtime.query_all(assertz);

//     const queries = [
//       `holds_next(F,V,${session.n}).`,
//       `nholds_next(F, V, ${session.n}).`,
//       `holds_inertia(F, V, ${session.n}).`,
//       `nholds_inertia(F, V, ${session.n}).`
//     ];

//     session.n++;

//     const results = [];
//     for (const q of queries) {
//       for (const ans of await session.runtime.query_all(q)) {
//         if ("F" in ans) {

//           results.push(`assertz(holds(${ans.F}, ${ans.V}, 0)).`);
//         }
//       }
//     }

//     console.log("foo", await session.runtime.query_all(results.join(" ")));

//     const holds = await session.runtime.query_all(`holds(F, V, 0).`);
//     console.log("holds at", session.n, holds);
//   });
// };
