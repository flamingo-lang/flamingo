import { expect } from "chai";
import { ALM } from "../src/parse";

describe("Parsing", () => {
    it.only("Query", () => {
        const result1 = ALM.Query.tryParse(`
        visible(Todo),
        active_filter = Filter,
        active(Todo).
        `);
        expect(result1.map((x: any) => x.value.fn))
            .to.have.members(["visible", "active", "active_filter"]);
    });
});
