import React, { createContext, FunctionComponent } from "react";
import { create } from "tau-prolog";
import { parseModule } from "./parse";
import { printModule } from "./projection_printer";

export type FlamingoSession = ReturnType<typeof create>;
export const createSession = (logic: string) => {
    const s = create();
    s.consult(printModule(parseModule(logic)));
    return s;
}

export const Provider: FunctionComponent<{session: FlamingoSession}> = ({session, children}) => {
    const ctx = createContext(session);
    
    return <ctx.Provider value={session}>
        {children}
    </ctx.Provider>
}
