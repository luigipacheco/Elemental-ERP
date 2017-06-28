Template.manufacturing.helpers({
  products:function(){ //calls the products based on a filter

      return Inventory.find({produceQty : {$gt:0} }, {sort:{produceQty:-1}});
   }
  });

Template.manufacturing.events({
  'click .js-make-product':function(event){ //if click on add product button
    var product_id= this._id;   //store ID
    Session.set({"ProductId":product_id});
    console.log(Session.get("ProductId"));

    var product = Inventory.findOne({_id:product_id});
    console.log(product);
    var productName = product.productName;
    var produceQty = product.produceQty;
    Modal.show('make_product', {productName:productName, produceQty:produceQty});
  }

})

Template.make_product.events({
  'submit .js-make-product':function(event){
  var makeQty = Number(event.target.makeQty.value);
  var pending = Number(Inventory.findOne({_id:Session.get("ProductId")}).produceQty);
  var currentstock = Number(Inventory.findOne({_id:Session.get("ProductId")}).atHand);
  var finalstock = currentstock + makeQty;
  var produceQty =  pending - makeQty;
  var log = "Made " + makeQty + " "+ Inventory.findOne({_id:Session.get("ProductId")}).productName;

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
             produceQty:produceQty
            }
         });

  }

  Modal.hide('make_product');                         //hide the modal after adding
  return false;
}
})
