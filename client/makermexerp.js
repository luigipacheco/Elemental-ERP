//routing
Router.configure({    //this configures the whole thing its what its seen by default
    layoutTemplate:'mainapp'
});

Router.route('/', function () {
  this.render('welcome',{        //render the welcome template to the main tag
    to:"main"
  });
});

Router.route('/products', function () {
  this.render('navbar',{           //render the navbar template to the navbar tag
    to:"navbar"
  });
  this.render('catalogue',{         //render the catalogue template to the main tag
    to:"main"
  });
  this.render('add_product',{         //render the catalogue template to the main tag
    to:"modal"
  });
  this.render('erp-navbar',{           //render the navbar template to the navbar tag
    to:"sec-navbar"
  });
});
Router.route('/admin', function () {
  this.render('navbar',{           //render the navbar template to the navbar tag
    to:"navbar"
  });
  this.render('admin',{         //render the catalogue template to the main tag
    to:"main"
  });
});
Router.route('/crm', function () {
  this.render('navbar',{           //render the navbar template to the navbar tag
    to:"navbar"
  });
  this.render('crm-navbar',{           //render the navbar template to the navbar tag
    to:"sec-navbar"
  });
  this.render('crm',{         //render the catalogue template to the main tag
    to:"main"
  });
  this.render('add_customer',{         //render the catalogue template to the main tag
    to:"modal"
  });
});

Router.route('/inventory', function () {
  this.render('navbar',{           //render the navbar template to the navbar tag
    to:"navbar"
  });
  this.render('erp-navbar',{           //render the navbar template to the navbar tag
    to:"sec-navbar"
  });
  this.render('inventory',{         //render the catalogue template to the main tag
    to:"main"
  });
  this.render('add_product',{         //render the catalogue template to the main tag
    to:"modal"
  });
  this.render('sell_product',{         //render the catalogue template to the main tag
    to:"modal2"
  });
});

Router.route('/manufacturing', function () {
  this.render('navbar',{           //render the navbar template to the navbar tag
    to:"navbar"
  });
  this.render('erp-navbar',{           //render the navbar template to the navbar tag
    to:"sec-navbar"
  });
  this.render('manufacturing',{         //render the catalogue template to the main tag
    to:"main"
  });
  this.render('add_product',{         //render the catalogue template to the main tag
    to:"modal"
  });
  // this.render('sell_product',{         //render the catalogue template to the main tag
  //   to:"modal2"
  // });
});

Router.route('/purchasing', function () {
  this.render('navbar',{           //render the navbar template to the navbar tag
    to:"navbar"
  });
  this.render('erp-navbar',{           //render the navbar template to the navbar tag
    to:"sec-navbar"
  });
  this.render('purchasing',{         //render the catalogue template to the main tag
    to:"main"
  });
  this.render('add_product',{         //render the catalogue template to the main tag
    to:"modal"
  });
  // this.render('sell_product',{         //render the catalogue template to the main tag
  //   to:"modal2"
  // });
});

Router.route('/customers', function () {
  this.render('navbar',{           //render the navbar template to the navbar tag
    to:"navbar"
  });
  this.render('crm-navbar',{           //render the navbar template to the navbar tag
    to:"sec-navbar"
  });
  this.render('customers',{         //render the catalogue template to the main tag
    to:"main"
  });
  this.render('add_customer',{         //render the catalogue template to the main tag
    to:"modal"
  });
});

Router.route('/invoice', function () {
  this.render('navbar',{           //render the navbar template to the navbar tag
    to:"navbar"
  });
  this.render('crm-navbar',{           //render the navbar template to the navbar tag
    to:"sec-navbar"
  });
  this.render('invoices',{         //render the catalogue template to the main tag
    to:"main"
  });
  this.render('create_invoice',{         //render the catalogue template to the main tag
    to:"modal"
  });
});
Router.route('/support', function () {
  this.render('navbar',{           //render the navbar template to the navbar tag
    to:"navbar"
  });
  this.render('crm-navbar',{           //render the navbar template to the navbar tag
    to:"sec-navbar"
  });
  this.render('tickets',{         //render the catalogue template to the main tag
    to:"main"
  });
  this.render('create_ticket',{         //render the catalogue template to the main tag
    to:"modal"
  });
});
Router.route('/tasks', function () {
  this.render('navbar',{           //render the navbar template to the navbar tag
    to:"navbar"
  });
  // this.render('crm-navbar',{           //render the navbar template to the navbar tag
  //   to:"sec-navbar"
  // });
  this.render('taskCol',{         //render the catalogue template to the main tag
    to:"main"
  });
  this.render('edit_task',{         //render the catalogue template to the main tag
    to:"modal"
  });
});

Router.route('/product/:_id', function () {
  this.render('navbar',{           //render the navbar template to the navbar tag
    to:"navbar"
  });
  this.render('erp-navbar',{           //render the navbar template to the navbar tag
    to:"sec-navbar"
  });
  this.render('product',{         //render the product template to the main tag
    to:"main",
    data:function(){
      return Inventory.findOne({_id:this.params._id}); //returns the id of the selected route parameter
    }
  });
});

console.log("client running");



//---

Session.set("productLimit",15);
//infinite scroll
lastScrollTop = 0;
$(window).scroll(function(event){
// test if we are near the bottom of the window
  if($(window).scrollTop() + $(window).height() > $(document).height() - 100) {
    // where are we in the page?
    var scrollTop = $(this).scrollTop();
    // test if we are going down
    if (scrollTop > lastScrollTop){
      // yes we are heading down...
     Session.set("productLimit", Session.get("productLimit") + 4);
    }
    lastScrollTop = scrollTop;
  }
})

Accounts.ui.config({  //asks for user name when registering
  passwordSignupFields: "USERNAME_AND_EMAIL"
});

Template.customers.helpers({
  customers:function(){ //calls the products based on a filter
     if (Session.get("userFilter")){// they set a filter!
       return Customers.find({createdBy:Session.get("userFilter")}, {sort:{rating:-1}, limit:Session.get("productLimit")}); //return the user its stored in the session get user filter
     }
     else {
       return Customers.find({}, {sort:{last:-1}, limit:Session.get("productLimit")});  // if nothing or something falsey is stored return all products!
     }
   }
});



Template.catalogue.helpers({
  products:function(){ //calls the products based on a filter
     if (Session.get("userFilter")){// they set a filter!
       return Products.find({createdBy:Session.get("userFilter")}, {sort:{rating:-1}, limit:Session.get("productLimit")}); //return the user its stored in the session get user filter
     }
     else {
       return Products.find({}, {sort:{rating:-1}, limit:Session.get("productLimit")});  // if nothing or something falsey is stored return all products!
     }
},
  filtering_products:function(){  //recognizes if the user has a filter enabled
     if (Session.get("userFilter")){
       return true;
     }
     else{
       return false;
     }
},
getFilterCategory:function(){ //returns the name of the filtered user products if the filter is active
  if (Session.get("userFilter")){
    var user = Meteor.users.findOne({_id:Session.get("userFilter")});
    return user.username;
  }
  else{
    return false;
  }
},

  getUser:function(user_id){    //**function that takes a user id and returns a user name. html: {{getUser user_id}}
    var user = Meteor.users.findOne({_id:user_id});
    if(user){
      return user.username;
    }
    else{
      return "anonymouse";
    }
  }
});   //calls the data from a collection named Products


Template.body.helpers({username:function(){ //calls the function into the {{username}} tag
  if (Meteor.user()){  //makes sure theres a user before running the code, else it wont run this
    console.log(Meteor.user().username);
    return Meteor.user().username;
  }
  else{  // else return this
    return "anonymouse";
  }
}

  });
Template.customers.events({
  'click .js-show-customer-form':function(event){ //if click on add product button
    $("#add_customer").modal('show');    //show the modal with add_product ID
  },

})

Template.invoices.events({
  'click .js-show-invoice-form':function(event){ //if click on add product button
    $("#create_invoice").modal('show');    //show the modal with add_product ID
  },

})

Template.tickets.events({
  'click .js-show-ticket-form':function(event){ //if click on add product button
    $("#create_ticket").modal('show');    //show the modal with add_product ID
  },

})

Template.catalogue.events({               //this looks for events in the catalogue template
  'click .js-product':function(event){   //on click  do:
    alert("inventory is runnung low!");   //alert
    console.log("inventory is low");       //print in console
    //$(event.target).css("width", "75px");   //change the size og the target to 75px
  },
  'click .js-del-product':function(event){ //if object with .js-del-product clicked
    var product_id= this._id   //store ID
    console.log(product_id);    //print ID on console
    $("#"+product_id).hide('fast', function(){  //animate
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
  },

  'click .js-set-user-filter':function(event){
    Session.set("userFilter",this.createdBy);     //saves the clicked user in the userFilter variable on session set
  },
  'click .js-remove-user-filter':function(event){
    Session.set("userFilter", undefined);       //Clears the variable on session set makes it falsey
  }
});

//  como cambiar el valor de un dato
// Inventory.update(Inventory.findOne({product:"cakes"})._id, {
//       $set: { price: 200 },
//     });
