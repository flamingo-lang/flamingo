import React, { createContext, FunctionComponent, useContext } from "react";
import { create } from "tau-prolog";
import { parseModule } from "./parse";
import { printModule } from "./projection_printer";

export type FlamingoSession = ReturnType<typeof create>;

export type FlamingoValue = string | boolean | number;

export const createSession = (logic: string) => {
    const s = create();
    s.consult(printModule(parseModule(logic)));
    return s;
}

const SessionContext = createContext<FlamingoSession>(undefined as unknown as FlamingoSession);

export const Provider: FunctionComponent<{session: FlamingoSession}> = ({session, children}) => {
    return <SessionContext.Provider value={session}>
        {children}
    </SessionContext.Provider>
}

export const useQuery = (query: string): Record<string, FlamingoValue | FlamingoValue[]> => {
    return {}
};

export const useDispatch = () => {
    const session = useContext(SessionContext);
    return (action: string, attributes?: Record<string, FlamingoValue>) => {}
};
