
// EAS - API
// Developed by Giuseppe Capoluongo 2k16 CC

// global
var User = Parse.Object.extend("User")
var Service = Parse.Object.extend("Service");
var SubService = Parse.Object.extend("SubService");
var ExtraService = Parse.Object.extend("ExtraService");
var Request = Parse.Object.extend("Request");

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
	retrieveAll.equalTo("enabled", true);
	retrieveAll.find({
	  success: function(results) {
	  	console.log("getServiceList > FOUND " + results.length + " OBJECTS")
	    res.success(results)
	  },
	  error: function(error) {
	    res.error(error);
	  }
	});
})

Parse.Cloud.define("getServiceWithID", function(req, res){
	console.log("getServiceWithID > CALLED")
	var objectID = req.params.objectID
	var retrieveWithID = new Parse.Query(Service)
	retrieveWithID.equalTo("enabled", true);
	retrieveWithID.get(objectID, {
	  success: function(results) {
	  	console.log("getServiceWithID > " + objectID + " FOUND")
	    res.success(results)
	  },
	  error: function(error) {
	    res.error(error);
	  }
	});
})

Parse.Cloud.define("saveNewRequest", function(req, res){
	var user = req.params.user
	var message = req.params.message
	var subject = req.params.subject
	var request = new Request()
	request.set("from", user)
	request.set("subject", subject)
	request.set("conversation", [subject])
	request.set("status", "notRead")
	request.set("newMessageReceived", true)
})

