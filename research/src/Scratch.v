Require Import Init.Nat Arith List FL.CpdtTactics.
Require Import Logic.Decidable.
Set Implicit Arguments.
Set Asymmetric Patterns.


Inductive Term : Set := 
    | NumTerm : nat -> Term
    | Plus : Term -> Term -> Term
    | Var : nat -> Term
    .

Fixpoint termDenote (t : Term) : nat := 
match t with
| NumTerm n => n
| Plus n n' => (termDenote n) + (termDenote n')
end.

Compute termDenote (Plus (Plus (NumTerm 0) (NumTerm 5)) (NumTerm 7)).

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

Lemma rels_are_decidable : forall (p : Prop) (r: RelOp) (n1 n2 : nat), (relOpDenote r) n1 n2  = p -> decidable p.
Proof.
    intros. destruct r; unfold decidable in *; crush.
Qed.

Lemma conj_decidable : forall (p1 p2 : Prop), decidable p1 /\ decidable p2 -> decidable (p1 /\ p2).
Proof. intros. crush. Qed.


Inductive Formula : Set := 
    | Rel : Term -> RelOp -> Term -> Formula
    | And : Formula -> Formula -> Formula
    | Or : Formula -> Formula -> Formula
    | Not : Formula -> Formula
    | ForAll : (nat -> Formula) -> Formula
    | Exists : (nat -> Formula) -> Formula
    .

Check Exists (fun x : nat => Rel (NumTerm 7) Lte (NumTerm x)).




Definition quantifier_free (f: Formula) : bool :=
    match f with 
    | ForAll _ => false
    | Exists _  => false
    | _ => true
    end.

Check forall n : nat, n = n.

Definition EliminateQuantifier (f : nat -> Formula) : Formula * Prop. Admitted.

Fixpoint Cooper (f : ) : Prop :=
match f with
| Exists f' => 

Fixpoint formDenote (f : Formula) : Prop := 
match f with
    | Rel t1 rel t2 => (relOpDenote rel) (termDenote t1) (termDenote t2)
    | And f1 f2 => (formDenote f1) /\ (formDenote f2)
    | Or f1 f2 => (formDenote f1) \/ (formDenote f2)
    | Not f1 => ~ (formDenote f1)
    | ForAll f' => forall n : nat, formDenote (f' n)
    | Exists f' => exists n : nat, formDenote(f' n)
end.

Hint Resolve rels_are_decidable.

Theorem quantifier_free_formulas_are_decidable : forall (f : Formula) (p : Prop),
  quantifier_free f = true ->
  formDenote f = p ->
  decidable p.
Proof.
intros f. induction f; eauto; intros; crush.
Qed.




Theorem formulas_are_decidable : forall (f : Formula) (p : Prop),
Proof.
Admitted.

