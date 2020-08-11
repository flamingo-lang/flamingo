% module simple
% enums
%    constant :: { c1, c2 } 
enum(constant, c1).
enum(constant c2).
% sorts
%     obj :: universe
sort(obj, universe).
%     a :: action
sort(a, action).
%         attributes
%             target : obj
attribute(a, target, obj).
%     a1 :: a
sort(a1, a).
%     a2 :: a
sort(a2, a).
% fluents
fluent(f, basic).
signature(f, 1, obj).
signature(f, ret, constant).
%     basic
%         f : obj -> constant
% axioms
% We'll use numbers as the names of the laws
% axiom d1
%     occurs(X) causes f(Obj) = c1 if
%         instance(X, a1),
%         X.target = Obj.
dlaw(d1)
parlist(d1, pars(x1, x2)).
par(1, pars(x1, x2), x1).
par(2, pars(x1, x2), x2).
action(d1, pars(x1, x2)).
head(d1, pars(x1, x2), f(x2)) :- par(2, pars(x1, x2), x2).


%     occurs(X) causes f(Obj) = c2 if
%         instance(X, a2),
%         X.target = Obj.
