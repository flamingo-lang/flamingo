import { create } from "tau-prolog";
import { readFileSync } from "fs";

describe.only("parsing", () => {
    it("Should work", () => {
        const logic = readFileSync("./test/prolog-projection.lp", { encoding: "utf-8" });
        const s = create();
        const parseResult = s.consult(logic);
        if (parseResult !== true) {
            throw new Error(parseResult.toString());
        }
    })
});