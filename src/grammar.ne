@builtin "whitespace.ne"

# Macros 
comma_seperated[X] -> $X _ ("," _ $X):*

# Terms
boolean -> "true" | "false"
identifier -> [a-z]:+ [A-Za-z0-9]:*
variable -> [A-Z]:+ [A-Za-z0-9]:*
integer -> "0" | positive_integer | "-" positive_integer
arithmetic_op -> "+" | "-" | "-" | "*" | "/" | "mod"
comparison_rel -> ">" | ">=" | "<" | "<="
arithmetic_rel -> eq | neq | comparison_rel
eq -> "="
neq -> "!="
basic_arithmetic_term -> variable | identifier | integer
basic_term -> basic_arithmetic_term | boolean
function_term -> identifier function_args
arithmetic_term -> basic_arithmetic_term _ arithmetic_op basic_arithmetic_term
term -> basic_term | arithmetic_term
positive_function_literal -> function_term | function_term eq term
function_literal -> positive_function_literal | "-" function_term | function_term neq term
literal -> function_literal | arithmetic_term _ arithmetic_rel _ arithmetic_term
var_id -> variable | identifier
body -> comma_seperated[literal] 
dynamic_causal_law -> "occurs(" _ var_id _ ")" __ "causes" __ positive_function_literal __ "if" __ body "."
state_contraint -> sc_head _  "if" _ body "."
sc_head -> "false" | positive_function_literal
definition -> function_term _ "if" _ body _ "."
executability_condition -> "impossible" _ "occurs(" _ var_id _ ")" _ "if" _  extended_body
extended_body_part -> literal | "occurs(" _ var_id _ ")" | "-" "occurs(" _ var_id _ ")"
extended_body -> comma_seperated[extended_body_part]
system_description -> _ "system description" _ identifier _ theory
theory -> "theory" _ identifier _ set_of_modules | "import" _ identifier _ "from" identifier
set_of_modules -> module:*
module -> "module" _ identifier _ module_body | "import" identifier "." identifier "from" identifier
module_body -> sort_declarations:? constant_declarations:? function_declarations:? axioms:?
sort_declarations -> "sort declarations" __ sort_decl:+
sort_decl -> identifier _ comma_seperated[identifier]:? "::" _ sort_name _ comma_seperated[sort_name]:? _ attributes
sort_name -> identifier | integer ".." integer
attributes -> attribute_decl:+
attribute_decl -> identifier ":" __ arguments:? __ identifier
arguments -> identifier __ ("x" __ identifier):? __ "->"
constant_declarations -> "object constants" _ constant_decl:+
constant_decl -> identifier _ constant_params _ ":" identifier
constant_params -> "(" _ identifier _ comma_seperated[identifier]:? _  ")"
function_declarations -> "function declarations" _ static_declarations:? _ fluent_declarations
static_declarations -> "statics" _ basic_function_declarations:? _  defined_function_declarations:?
fluent_declarations -> "fluents" _ basic_function_declarations:? _  defined_function_declarations:?
basic_function_declarations -> "basic" _ function_decl:+
defined_function_declarations -> "defined" _ function_decl:+
function_decl -> "total":? _ identifier _ ":" _ arguments __ identifier
axioms -> "axioms" axiom:+
axiom -> dynamic_causal_law | state_contraint | definition | executability_condition
