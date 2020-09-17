Require Import Init.Nat Arith List FL.CpdtTactics.
Require Import Logic.Decidable.
Set Implicit Arguments.
Set Asymmetric Patterns.

Inductive Term : Set := 
    | NumTerm : nat -> Term
    | Plus : Term -> Term -> Term
    .

Fixpoint termDenote (t : Term) : nat := 
match t with
| NumTerm n => n
| Plus n n' => (termDenote n) + (termDenote n')
end.

Eval simpl in termDenote (Plus (Plus (NumTerm 0) (NumTerm 5)) (NumTerm 7)).

Inductive RelOp : Set := 
    | Eq
    | Lt
    | Lte
    . 

Definition relOpDenote (r : RelOp) : nat -> nat -> Prop :=
match r with
| Eq => eq
| Lt => lt
| Lte => le
end.

Inductive Formula : Set := 
    | And : Formula -> Formula -> Formula
    | Or : Formula -> Formula -> Formula
    | Not : Formula -> Formula
    | ForAll : (nat -> Formula) -> Formula
    | Exists : (nat -> Formula) -> Formula
    | Rel : Term -> RelOp -> Term -> Formula
    .

Fixpoint formDenote (f : Formula) : Prop := 
match f with
    | And f1 f2 => (formDenote f1) /\ (formDenote f2)
    | Or f1 f2 => (formDenote f1) \/ (formDenote f2)
    | Not f1 => ~ (formDenote f1)
    | Rel t1 rel t2 => (relOpDenote rel) (termDenote t1) (termDenote t2)
    | ForAll f' => forall n : nat, formDenote (f' n)
    | Exists f' => exists n : nat, formDenote(f' n)
end.

Theorem formulas_are_decidable : forall (f : Formula) (p : Prop),
  formDenote f = p ->
  decidable p.
Proof.
intros f.
induction f.
- crush.
- crush.
- crush.
- simpl. intros. apply p in H.
