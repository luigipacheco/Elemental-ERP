console.log("server running");

if (!(Meteor.users.findOne({username: "admin"}))) {
  Accounts.createUser({
                              username: "admin",
                              password :"admin123",

      });

  var adminuser = Accounts.findUserByUsername("admin")._id;

  Roles.addUsersToRoles( adminuser, ['admin'] );

};
