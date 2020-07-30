

/* cSpell:disable*/
// ship_to(ProdName, City) :-
//     has_ordered(CustNo, ProdNo),
//     customer_city(CustNo, City),
//     product_name(ProdNo, ProdName).



(has_ordered, customer_city, product_name, CustNo, ProdNo, City, ProdName) =>
        has_ordered(CustNo, ProdNo) &&
        customer_city(CustNo, City) &&
        product_name(ProdNo, ProdName) &&
        ["ship_to", [ProdName, City]]
          
        

