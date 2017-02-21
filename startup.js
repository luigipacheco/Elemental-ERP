if (Meteor.isServer){
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
    })
}
