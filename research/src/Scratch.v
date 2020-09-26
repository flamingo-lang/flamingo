Require Import Init.Nat Arith List FL.CpdtTactics.
Require Import Logic.Decidable.
Set Implicit Arguments.
Set Asymmetric Patterns.


Inductive Term : Set := 
    | NumTerm : nat -> Term
    | Plus : Term -> Term -> Term
    .
Compute NumTerm 7.

Fixpoint termDenote (t : Term) : nat := 
match t with
| NumTerm n => n
| Plus n n' => (termDenote n) + (termDenote n')
end.

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


(* decidable p = p \/ ~p.  *)

Lemma rels_are_decidable : forall (p : Prop) (r: RelOp) (n1 n2 : nat), (relOpDenote r) n1 n2  = p -> decidable p.
Proof.
    intros. destruct r.
    - unfold decidable. crush.
    - unfold decidable. crush.
    - unfold decidable. crush.
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


Fixpoint quantifier_free (f: Formula) : bool :=
    match f with 
    | ForAll _ => false
    | Exists _  => false
    | And f1 f2 => (quantifier_free f1) && (quantifier_free f2)
    | Or f1 f2 => (quantifier_free f1) && (quantifier_free f2)
    | Not f' => quantifier_free f'
    | Rel _ _ _ => true
    end.

Lemma quantifier_free_conj : forall (f1 f2: formula)

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
Hint Resolve conj_decidable.
Theorem quantifier_free_formulas_are_decidable : forall (f : Formula) (p : Prop),
  quantifier_free f = true ->
  formDenote f = p ->
  decidable p.
Proof.
intros f. induction f; intros; eauto.
- intros. crush. apply conj_decidable. crush.
- crush.
Qed.

Fixpoint Cooper (f : ) : Prop :=
match f with
| Exists f' => 







Theorem formulas_are_decidable : forall (f : Formula) (p : Prop),
Proof.
Admitted.

Definition EliminateQuantifier (f : nat -> Formula) : Formula * Prop. Admitted.
