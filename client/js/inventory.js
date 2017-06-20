Template.inventory.helpers({
  products:function(){ //calls the products based on a filter
     if (Session.get("userFilter")){// they set a filter!
       return Inventory.find({createdBy:Session.get("userFilter")}, {sort:{rating:-1}, limit:Session.get("productLimit")}); //return the user its stored in the session get user filter
     }
     else {
       return Inventory.find({}, {sort:{last:-1}, limit:Session.get("productLimit")});  // if nothing or something falsey is stored return all products!
     }
   },
   "isManufactured":function(){
     return this.isManufactured == "SI";
   },
   "isPurchased":function(){
     return this.isManufactured == "NO";
   }
});


Template.inventory.events({
  'click .js-show-inventory-form':function(event){ //if click on add product button
    $("#add_product").modal('show');
       //show the modal with add_product ID
  },
  'click .js-sell-product':function(event){ //if click on add product button
    var product_id= this._id;   //store ID
    Session.set({"ProductId":product_id});
    console.log(Session.get("ProductId"));

    var product = Inventory.findOne({_id:product_id});
    console.log(product);
    var productName = product.productName;
    var atHand = product.atHand;
    Modal.show('sell_product', {productName:productName, atHand:atHand});
    //$("#sell_product").modal('show');    //show the modal with add_product ID
  },
  'click .js-buy-product':function(event){ //if click on add product button
    var product_id= this._id;   //store ID
    Session.set({"ProductId":product_id});
    console.log(Session.get("ProductId"));

    var product = Inventory.findOne({_id:product_id});
    console.log(product);
    var productName = product.productName;
    var atHand = product.atHand;
    Modal.show('buy_product', {productName:productName, atHand:atHand});
  },
  'click .js-consume-product':function(event){ //if click on add product button
    var product_id= this._id;   //store ID
    Session.set({"ProductId":product_id});
    console.log(Session.get("ProductId"));

    var product = Inventory.findOne({_id:product_id});
    console.log(product);
    var productName = product.productName;
    var atHand = product.atHand;
    Modal.show('consume_product', {productName:productName, atHand:atHand});
},
'click .js-manufacture-product':function(event){ //if click on add product button
  var product_id= this._id;   //store ID
  Session.set({"ProductId":product_id});
  console.log(Session.get("ProductId"));

  var product = Inventory.findOne({_id:product_id});
  console.log(product);
  var productName = product.productName;
  var atHand = product.atHand;
  Modal.show('order_product_manufacture', {productName:productName, atHand:atHand});
}
}),

Template.consume_product.events({
  'submit .js-consume-product':function(event){
  var currentstock = Inventory.findOne({_id:Session.get("ProductId")}).atHand;
  var consumeQty = event.target.consumeQty.value;
  var finalstock = +currentstock - +consumeQty;
  console.log(finalstock);

  if (Meteor.user()){
    Inventory.update(Session.get("ProductId"), {
           $set: {
             atHand:finalstock
            }
         });

  }

  Modal.hide('consume_product');                         //hide the modal after adding
  return false;
}
})

Template.order_product_manufacture.events({
  'submit .js-manufacture-product':function(event){
  var produceQty = Number(event.target.produceQty.value);
  console.log("Manufacturing " +produceQty + " "+ Inventory.findOne({_id:Session.get("ProductId")}).productName);

  if (Meteor.user()){
    Inventory.update(Session.get("ProductId"), {
           $set: {
             produceQty:produceQty
            }
         });

  }

  Modal.hide('order_product_manufacture');                         //hide the modal after adding
  return false;
}
})

Template.sell_product.events({
  'submit .js-sell-product':function(event){
  var currentstock = Inventory.findOne({_id:Session.get("ProductId")}).atHand;
  var sellQty = event.target.sellQty.value;
  var finalstock = +currentstock - +sellQty;
  console.log(finalstock);

  if (Meteor.user()){
    Inventory.update(Session.get("ProductId"), {
           $set: {
             atHand:finalstock
            }
         });

  }

  Modal.hide('sell_product');                         //hide the modal after adding
  return false;
}
})

Template.buy_product.events({
  'submit .js-buy-product':function(event){
  var currentstock = Inventory.findOne({_id:Session.get("ProductId")}).atHand;
  var buyQty = event.target.buyQty.value;
  var finalstock = +currentstock + +buyQty;
  console.log(finalstock);

  if (Meteor.user()){
    Inventory.update(Session.get("ProductId"), {
           $set: {
             atHand:finalstock
            }
         });
  }

  Modal.hide('buy_product');                         //hide the modal after adding
  return false;
}
})

Template.add_product.events({                //this looks for events on the add product template
   'submit .js-add-product':function(event){         //if sumbmit event happens
     var productName, atHand, supplier, isManufactured;                                 //create variables
     var min, orderQty, price, cost, comment ;
     productName = event.target.productName.value;                //store variables
     atHand = event.target.atHand.value;
     supplier = event.target.supplier.value;
     min = event.target.min.value;
     orderQty = event.target.orderQty.value;
     isManufactured = event.target.isManufactured.value;
     price = event.target.price.value;
     cost = event.target.cost.value;
     comment = event.target.comment.value;

     console.log("Product "+productName +" added");            //print to console
     if (Meteor.user()){
       Inventory.insert({                                       // insert thw following to the data base
         productName:productName,
         atHand:atHand,
         supplier:supplier,
         min:min,
         orderQty:orderQty,
         isManufactured:isManufactured,
         price:price,
         cost:cost,
         comment:comment,
         createdOn:new Date(),
         createdBy:Meteor.user()._id
       });
     }

     $("#add_product").modal('hide');                           //hide the modal after adding
     return false;                                                  //do not refresh the page!
   }

})
Template.product.events({
  'click .js-del-product':function(event){ //if object with .js-del-product clicked
    var product_id= this._id   //store ID
    console.log("deleted "+ product_id);    //print ID on console
      //animate
    Inventory.remove({"_id":product_id});     //delete the product

  },
    'click .js-cancel':function(event){ //if object with .js-del-product clicked
      Router.go('/inventory');
    },

  'submit .js-edit-product':function(event){         //if sumbmit event happens
    var productName, atHand, supplier, isManufactured;                                 //create variables
    var min, orderQty, price, cost, comment ;
    productName = event.target.productName.value;                //store variables
    atHand = event.target.atHand.value;
    supplier = event.target.supplier.value;
    min = event.target.min.value;
    orderQty = event.target.orderQty.value;
    isManufactured = event.target.isManufactured.value;
    price = event.target.price.value;
    cost = event.target.cost.value;
    comment = event.target.comment.value;




    if (Meteor.user()){
      console.log("Product "+productName +" updated");            //print to console
      Inventory.update(this._id, {
             $set: {
               productName:productName,
               atHand:atHand,
               supplier:supplier,
               min:min,
               orderQty:orderQty,
               isManufactured:isManufactured,
               price:price,
               cost:cost,
               comment:comment
              }
           });
    }
    Router.go('/inventory');
    return false;
                                                      //do not refresh the page!
  }
})
// Template.add_product.events({                //this looks for events on the add product template
//    'submit .js-add-product':function(event){         //if sumbmit event happens
//      var img_src, img_alt;                                 //create variables
//      img_src = event.target.img_src.value;                //store variables
//      img_alt = event.target.img_alt.value;
//      console.log("src: "+img_src+" alt: "+img_alt);            //print to console
//      if (Meteor.user()){
//        Products.insert({                                       // insert thw following to the data base
//          img_src:img_src,
//          img_alt:img_alt,
//          createdOn:new Date(),
//          createdBy:Meteor.user()._id
//        });
//      }
//
//      $("#add_product").modal('hide');                           //hide the modal after adding
//      return false;                                                  //do not refresh the page!
//    }
