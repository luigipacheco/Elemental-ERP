Products = new Mongo.Collection("products"); //database for products
Customers = new Mongo.Collection("customers"); //database for customers
Invoices = new Mongo.Collection("invoices"); //database for invoices
Tickets = new Mongo.Collection("tickets"); //database for support tickets
Inventory = new Mongo.Collection("inventory"); // database for inventory
Log = new Mongo.Collection("log");
export const Tasks = new Mongo.Collection('tasks');


//Set up securitu on images collection
Products.allow({
  insert:function(userId, doc){
    console.log("security test on image insert");
    if (Meteor.user()){   //test if user is logged in
      if(userId != doc.createdBy){  //test if user logged in is the right one on doc
        return false;
      }
      else{
          return true;   //allows the insert function if true
      }
    }
    else{  //user not logged in
      return false
    }
  },
  remove:function(userId, doc){
    console.log("security test on image insert");
    if (Meteor.user()){   //test if user is logged in
      if(userId != doc.createdBy){  //test if user logged in is the right one on doc
        return false;
      }
      else{
          return true;   //allows the insert function if true
      }
    }
    else{  //user not logged in
      return false
    }
  },
  update:function(userId, doc){
    console.log("security test on rating update");
    if (Meteor.user()){   //test if user is logged in
      if(userId != doc.createdBy){  //test if user logged in is the right one on doc
        console.log("not a user");
        return false;
      }
      else{
          return true;   //allows the insert function if true
      }
    }
    else{  //user not logged in
      return false
    }
  }
})
