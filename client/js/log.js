Template.logs.helpers({
  logs(){
  return Log.find({}, {sort:{createdAt: -1}});
}
})

Template.logs.events({
  'click .js-clear-save-log':function(event){
    console.log("Log cleared save PDF");
    // Blaze.saveAsPDF(Template.logs, {
    //   filename: "log.pdf", // optional, default is "document.pdf"
    //   //data: datauri, // optional, render the template with this data context
    //   x: 10, // optional, left starting position on resulting PDF, default is 4 units
    //   y: 10, // optional, top starting position on resulting PDF, default is 4 units
    //   orientation: "portrait", // optional, "landscape" or "portrait" (default)
    //   unit: "mm", // optional, unit for coordinates, one of "pt", "mm" (default), "cm", or "in"
    //   format: "letter" // optional, see Page Formats, default is "a4"
    // });
    Blaze.outputAsPDF(Template.logs, 'dataurlnewwindow');
    Meteor.call("clearLog");
  }
})
