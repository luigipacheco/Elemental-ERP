Template.purchasing.helpers({
  products:function(){ //calls the products based on a filter

      return Inventory.find({purchaseQty : {$gt:0} }, {sort:{purchaseQty:-1}});
   }
  });
  Template.purchasing.events({
    'click .js-purchase-product':function(event){ //if click on add product button
      var product_id= this._id;   //store ID
      Session.set({"ProductId":product_id});
      console.log(Session.get("ProductId"));

      var product = Inventory.findOne({_id:product_id});
      console.log(product);
      var productName = product.productName;
      var purchaseQty = product.purchaseQty;
      Modal.show('purchase_product', {productName:productName, purchaseQty:purchaseQty});
    }

  })

  Template.purchase_product.events({
    'submit .js-purchase-product':function(event){
    var receiveQty = Number(event.target.receiveQty.value);
    var pending = Number(Inventory.findOne({_id:Session.get("ProductId")}).purchaseQty);
    console.log(log);
    var currentstock = Number(Inventory.findOne({_id:Session.get("ProductId")}).atHand);
    var finalstock = currentstock + receiveQty;
    var purchaseQty =  pending - receiveQty;
    var log = "Purchased " + receiveQty + " "+ Inventory.findOne({_id:Session.get("ProductId")}).productName;

    if (Meteor.user()){
      console.log(log);
      Log.insert(
        {
        createdAt:new Date(),
        username:Meteor.user().username,
        log:log
        }
        );
      Inventory.update(Session.get("ProductId"), {
             $set: {
               atHand:finalstock,
               purchaseQty:purchaseQty
              }
           });

    }

    Modal.hide('purchase_product');                         //hide the modal after adding
    return false;
  }
  })
