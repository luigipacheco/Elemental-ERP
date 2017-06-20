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
