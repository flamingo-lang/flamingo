const P = require("parsimmon");
const Parsimmon = P;

const ALMParser = P.createLanguage({

});
function PyX(indent) {
  return P.createLanguage({

  });
}

// Start parsing at zero indentation
let Pythonish = PyX(0);

///////////////////////////////////////////////////////////////////////
var Lang = Parsimmon.createLanguage({
  Value: function(r) {
    return Parsimmon.alt(r.Number, r.Symbol, r.List);
  },
  Number: function() {
    return Parsimmon.regexp(/[0-9]+/).map(Number);
  },
  Symbol: function() {
    return Parsimmon.regexp(/[a-z]+/);
  },
  List: function(r) {
    return Parsimmon.string("(")
      .then(r.Value.sepBy(r.__))
      .skip(Parsimmon.string(")"));
  },
  _: () => Parsimmon.optWhitespace,
  __: () => Parsimmon.whitespace
});

console.log(Lang.Value.tryParse("(list 1 2 foo (list nice 3 56 989 asdasdas))"));

// const testFile = require("fs").readFileSync("../test/test.alm").toString();
// console.log(testFile);
