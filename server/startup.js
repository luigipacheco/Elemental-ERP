import { Tasks } from '../lib/collections.js';

Meteor.startup(function(){     //runs only on startup
  if (Products.find().count()== 0){   // checks for content in the products collection
    Products.insert(                  //inserts an example product in case none is found
      {
      img_src:"images/sample.png",
      img_alt:"example product"
      }
      );
      console.log("startup.js sez: Example product added to Product collection");
  }
  if (Customers.find().count()== 0){   // checks for content in the products collection
    Customers.insert(                  //inserts an example product in case none is found
      {
      name:"some",
      lastname:"dude",
      email:"example@example.com",
      company:"Testing LLC"
      }
      );
      console.log("startup.js sez: Example customer added to Customer collection");
  }
  if (Inventory.find().count()== 0){   // checks for content in the products collection
    Inventory.insert(                  //inserts an example product in case none is found
      {
      productName:"test",
      atHand:"10",
      min:"10",
      cost:"10",
      price:"20"
      }
      );
      console.log("startup.js sez: Example customer added to Customer collection");
  }
  if (Tasks.find().count()== 0){   // checks for content in the products collection
    Tasks.insert(                  //inserts an example product in case none is found
      {
      text:"some",
      username:"dude",
      }
      );
      console.log("startup.js sez: Example task added to Tasks collection");
  }
  if (Log.find().count()== 0){   // checks for content in the products collection
    Log.insert(                  //inserts an example product in case none is found
      {
      createdAt:new Date(),
      username:"dude",
      log:"First Log ever"
      }
      );
      console.log("startup.js sez: First Log created");
  }

})
