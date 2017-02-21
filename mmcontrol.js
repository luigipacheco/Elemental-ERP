Products = new Mongo.Collection("products"); //creates a database  named products
console.log(Products.find().count());  // prints the number of objects in the products database

if (Meteor.isClient){  //runs on the client
//test array
//   var product_data= [   //creates an array of objects
//     {
//     img_src:"images/001.jpg",
//     img_alt:"MM1 3D printer"
//     },
//     {
//     img_src:"images/002.jpg",
//     img_alt:"Mi3 3D printer"
//     },
//     {
//     img_src:"images/003.png",
//     img_alt:"PLA fillament"
//     },
// ];
//end if test array

  //Template.inventory.helpers({products:product_data});   //calls the data from a named array named products commented before
  Template.inventory.helpers({products:Products.find()});   //calls the data from a collection named Products

  Template.inventory.events({
    'click .js-product':function(event){   //on click  do:
      alert("inventory is runnung low!");   //alert
      console.log("inventory is low");       //print in console
      $(event.target).css("width", "75px");   //change the size og the target to 75px

    }
  })

}
if (Meteor.isServer){
  console.log("this is server");  //prints only in the server (when meteor starts on the console)

}
