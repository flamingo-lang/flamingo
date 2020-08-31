// import { pLimit } from "./pLimit";
// import { parseModule } from "./parse";
// import { printModule, printQuery } from "./projection_printer";
// import Pl from "./tau-prolog";
// import { load } from "./tau-list";
// load(Pl);

// const limit = pLimit(1);

// export type FlamingoSession = { runtime: ReturnType<typeof Pl.create>; n: number };

// export type FlamingoValue = string | boolean | number;

// export type FlamingoQueryResult = Record<
//   string,
//   (FlamingoValue | FlamingoValue[]) | undefined
// >;

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

//           if (k in prev) {
//             if (
//               Array.isArray(prev[k]) &&
//               !(prev[k] as FlamingoValue[]).includes(val)
//             ) {
//               (prev[k] as FlamingoValue[]).push(val);
//             } else if (prev[k] !== val) {
//               prev[k] = [prev[k] as FlamingoValue, val];
//             }
//           } else {
//             prev[k] = val;
//           }
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
