/* cSpell:disable*/

// % product shipping example

// customer_city(1, london).
// customer_city(2, paris).
// customer_city(3, 'San Francisco').

// has_ordered(1, 1).
// has_ordered(2, 2).
// has_ordered(3, 3).

// product_name(1, tea).
// product_name(2, bread).
// product_name(3, flowers).

// ship_to(ProdName, City) :-
//     has_ordered(CustNo, ProdNo),
//     customer_city(CustNo, City),
//     product_name(ProdNo, ProdName).

const customer_city_tuples = [
    [1, "london"],
    [2, "paris"],
    [3, "San Francisco"],
];

const has_ordered_tuples = [
    [1, 1],
    [2, 2],
    [3, 3],
];

const product_name_tuples = [
    [1, "tea"],
    [2, "bread"],
    [3, "flowers"]
];

const ___ = Symbol("wildcard");

const flip = (shouldFlip, b) => shouldFlip ? !b : b;

/**
 * Takes a set of tuples `S` and produces a matching function
 * that takes in a tuple (with optional wild cards) and finds
 * every tuple in `S` that matches that tuple.
 */
const input_rule = (tuples) => (negated, iattrs, cb, ) =>
    tuples.filter((attrs) =>
        flip(negated, attrs.every((_, i) => iattrs[i] === ___ || attrs[i] === iattrs[i])))
        .flatMap(cb)

const has_ordered = input_rule(has_ordered_tuples)
const customer_city = input_rule(customer_city_tuples);
const product_name = input_rule(product_name_tuples);

const ans = has_ordered(false, [___, ___], ([CustNo, ProdNo]) =>
    customer_city(false, [CustNo, ___], ([_, City]) =>
        product_name(false, [ProdNo, ___], ([_, ProdName]) =>
            [["ship_to", [ProdName, City]]])))

console.log(ans);
// =>
// [
//     [ 'ship_to', [ 'tea', 'london' ] ],
//     [ 'ship_to', [ 'bread', 'paris' ] ],
//     [ 'ship_to', [ 'flowers', 'San Francisco' ] ]
// ]
  
