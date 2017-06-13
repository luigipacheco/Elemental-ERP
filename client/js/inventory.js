Template.inventory.helpers({
  customers:function(){ //calls the products based on a filter
     if (Session.get("userFilter")){// they set a filter!
       return Inventory.find({createdBy:Session.get("userFilter")}, {sort:{rating:-1}, limit:Session.get("productLimit")}); //return the user its stored in the session get user filter
     }
     else {
       return Inventory.find({}, {sort:{last:-1}, limit:Session.get("productLimit")});  // if nothing or something falsey is stored return all products!
     }
   }
});


Template.inventory.events({
  'click .js-show-inventory-form':function(event){ //if click on add product button
    $("#add_product").modal('show');    //show the modal with add_product ID
  },

})
