
// EAS - API
// Developed by Giuseppe Capoluongo 2k16 CC

// global
var User = Parse.Object.extend("User")
var Service = Parse.Object.extend("Service");
var SubService = Parse.Object.extend("SubService");
var ExtraService = Parse.Object.extend("ExtraService");

Parse.Cloud.define('hello', function(req, res) {
  res.success('Hi');
});


// v 1.0 
/*
getSeviceList() > list all services enabled as json ["id":"", "title":"", "shortDescription":"", "imageURL":"", "imageAlt":""]
getServiceWithID(objectID: String) > PFObject
*/

Parse.Cloud.define("getServiceList", function(req, res){
	console.log("getServiceList > CALLED")
	var retrieveAll = new Parse.Query(Service)
	var objects = new Array()
	retrieveAll.find({
	  success: function(results) {
	  	console.log("getServiceList > FOUND " + results.length + "OBJECTS")
	    for (var i = 0; i < results.length; i++) {
	      objects[i]["id"] = results[i].id;
	      objects[i]["title"] = results[i].get("title");
	      objects[i]["shortDescription"] = results[i].get("shortDescription");
	    }
	    console.log("getServiceList > FETCHED " + objects.length + "OBJECTS")
	    res.success(objects)
	  },
	  error: function(error) {
	    res.error(error);
	  }
	});
})

