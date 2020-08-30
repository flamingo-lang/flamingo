import React, { createContext, FunctionComponent, useContext } from "react";
import { create, format_answer } from "tau-prolog";
import PLimit from "p-limit";
import { Subject } from "rxjs";
import { map, mergeMap } from "rxjs/operators";
import { useObservable } from "rxjs-hooks";
import { parseModule } from "./parse";
import { printModule, printQuery } from "./projection_printer";
import * as R from "rambda";

const limit = PLimit(1);

export type FlamingoSession = { runtime: ReturnType<typeof create>; n: number };

export type FlamingoValue = string | boolean | number;

export type FlamingoQueryResult = Record<
  string,
  (FlamingoValue | FlamingoValue[]) | undefined
>;

export const createSession = (logic: string): FlamingoSession => {
  const s = create();
  const translatedModule = printModule(parseModule(logic));
  s.consult(translatedModule);
  return { runtime: s, n: 0 };
};

const SessionContext = createContext<FlamingoSession>(
  (undefined as unknown) as FlamingoSession
);

export const Provider: FunctionComponent<{ session: FlamingoSession }> = ({
  session,
  children,
}) => {
  return (
    <SessionContext.Provider value={session}>
      {children}
    </SessionContext.Provider>
  );
};

export const runQuery = (
  session: FlamingoSession,
  query: string
): Promise<FlamingoQueryResult> => {
  return limit(
    () =>
      new Promise((res) => {
        const translatedQuery = printQuery(session.n, query);
        session.runtime.query(translatedQuery);
        let answers: [string, string][] = [];
        session.runtime.answers(
          (ans) => {
            const fmt = format_answer(ans).slice(0, -1);
            if (fmt !== "false") {
              const subs = fmt
                .split(",")
                .map((x) => x.trim())
                .map((x) => x.split(" = "));

              answers = answers.concat(subs as any);
            }
          },
          10000,
          () => {
            const ret = {} as FlamingoQueryResult;
            for (const [v, val] of answers) {
              const parsedVal = ((): FlamingoValue => {
                if (val === "true" || val === "false") {
                  return Boolean(val);
                } else if (!Number.isNaN(Number(val))) {
                  return Number(val);
                } else {
                  return val;
                }
              })();

              if (v in ret) {
                if (
                  Array.isArray(ret[v]) &&
                  !(ret[v] as FlamingoValue[]).includes(parsedVal)
                ) {
                  (ret[v] as FlamingoValue[]).push(parsedVal);
                } else if (ret[v] !== parsedVal) {
                  ret[v] = [ret[v] as FlamingoValue, parsedVal];
                }
              } else {
                ret[v] = parsedVal;
              }
            }
            res(ret);
          }
        );
      })
  );
};

const actionSubject = new Subject();

const queryMap: Record<string, Subject<FlamingoQueryResult>> = {};

export const useQuery = (query: string): FlamingoQueryResult | null => {
  const session = useContext(SessionContext);
  const obs = actionSubject.pipe(mergeMap(() => runQuery(session, query)));
  return useObservable(() => obs);
};

export const dispatch = (
  session: FlamingoSession,
  action: string,
  attributes: Record<string, FlamingoValue>
): Promise<void> => {
  return limit(async () => {
    const name = `${action}${session.n}`;
    const attrs = R.values(
      R.map(
        (v: any, k: any) => `assertz(holds(static(${k}(${name}), ${v}))).`,
        attributes
      )
    ).join("\n");
    const assertz = `
    assertz(dom(${action}, ${name})).
    ${attrs}
    assertz(occurs(${name}, ${session.n})).`;

    await new Promise((res) => {
      session.runtime.query(assertz),
        session.runtime.answers(() => {}, 10000, res);
    });

    const query1 = `holds_next(F1,V1,${session.n}). nholds_next(F2, V2, ${session.n}). holds_inertia(F3, V3, ${session.n}). nholds_inertia(F4, V4, ${session.n}).`;

    session.n++;

    const results1: [string, string][] = await new Promise((res) => {
      session.runtime.query(query1);
      let answers: [string, string][] = [];
      session.runtime.answers(
        (ans) => {
          const fmt = format_answer(ans).slice(0, -1);
          if (fmt !== "false") {
            answers.push(
              fmt.split(",").map((x) => x.trim().slice(5)) as [string, string]
            );
          }
        },
        10000,
        () => res(answers)
      );
    });

    const query2 = results1
      .map((x) => {
        const [f, v] = x;
        return `assertz(holds(${f}, ${v}, ${session.n})).`;
      })
      .join(" ");

    await new Promise((res) => {
      session.runtime.query(query2);
      session.runtime.answers(() => {}, 100000, res);
    });

    actionSubject.next();
  });
};

export const useDispatch = () => {
  const session = useContext(SessionContext);
  return (action: string, attributes?: Record<string, FlamingoValue>) =>
    dispatch(session, action, attributes ?? {});
};
