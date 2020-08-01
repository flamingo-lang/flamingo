import { equal } from "./equal";

export class TupleSet<A> {
    private set = new Set();

    constructor(tuples: A[]) {
        for (const t of tuples) {
            this.set.add(t);
        }
    }

    add(tuple) {
        let included = false;
        for (const t of this.set.values()) {
            if (equal(t, tuple)) included = true;
        }

        if (!included) {
            this.set.add(tuple);
        }
    }

    values() {
        return Array.from(this.set.values());
    }

    equal(tupleSet: TupleSet<A>) {
        return equal(this.values(), tupleSet.values());
    }
}