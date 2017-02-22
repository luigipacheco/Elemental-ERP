Products = new Mongo.Collection("products"); //creates a database  named products
console.log(Products.find().count());  // prints the number of objects in the products database

if (Meteor.isClient){  //runs on the client

  Template.inventory.helpers({products:
    Products.find({},{sort:{rating:-1}})
  });   //calls the data from a collection named Products

  Template.inventory.events({               //this looks for events in the inventory template
    'click .js-product':function(event){   //on click  do:
      alert("inventory is runnung low!");   //alert
      console.log("inventory is low");       //print in console
      $(event.target).css("width", "75px");   //change the size og the target to 75px
    },
    'click .js-del-product':function(event){ //if object with .js-del-product clicked
      var product_id= this._id   //store ID
      console.log(product_id);    //print ID on console
      $("#"+product_id).hide('slow', function(){  //animate
          Products.remove({"_id":product_id});     //delete the product
      })
    },
    'click .js-rate-product':function(event){   //when cick in star
      var rating =$(event.currentTarget).data("userrating");  //get # of the star
      console.log("you clicked a star "+rating);
      var product_id = this.id;     //get product id and set it in a variable
      console.log(product_id);
      Products.update({_id:product_id},{$set:{rating:rating}});  //take the product from the id and set rating to rating.
    },
    'click .js-show-product-form':function(event){ //if click on add product button
      $("#add_product").modal('show');    //show the modal with add_product ID
    }
  });
  Template.add_product.events({                //this looks for events on the add product template
     'submit .js-add-product':function(event){         //if sumbmit event happens
       var img_src, img_alt;                                 //create variables
       img_src = event.target.img_src.value;                //store variables
       img_alt = event.target.img_alt.value;
       console.log("src: "+img_src+" alt: "+img_alt);            //print to console
       Products.insert({                                       // insert thw following to the data base
         img_src:img_src,
         img_alt:img_alt,
         createdOn:new Date()
       });
       $("#add_product").modal('hide');                           //hide the modal after adding
       return false;                                                  //do not refresh the page!
     }

  });

}
if (Meteor.isServer){
  console.log("this is server");  //prints only in the server (when meteor starts on the console)

}
