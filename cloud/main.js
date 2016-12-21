
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

// For todays date;
Date.prototype.today = function () { 
    return ((this.getDate() < 10)?"0":"") + this.getDate() +"/"+(((this.getMonth()+1) < 10)?"0":"") + (this.getMonth()+1) +"/"+ this.getFullYear();
}

// For the time now
Date.prototype.timeNow = function () {
    return ((this.getHours() < 10)?"0":"") + this.getHours() +":"+ ((this.getMinutes() < 10)?"0":"") + this.getMinutes() +":"+ ((this.getSeconds() < 10)?"0":"") + this.getSeconds();
}

function getDate(){
	return new Date().today() + " @ " + new Date().timeNow();
}

function messageJSON(text, sender){
	var jsonObj =  new Object
	jsonObj.body = text
	jsonObj.sender = sender
	jsonObj.date = getDate()
	return JSON.stringify(jsonObj)
}

Parse.Cloud.define("saveNewRequest", function(req, res){
	var user = req.params.user
	var messageBody = req.params.message
	var subject = req.params.subject
	var request = new Request()
	var message = messageJSON(messageBody, "user")
	request.set("from", user)
	request.set("subject", subject)
	request.set("conversation", [subject])
	request.set("status", "notRead")
	request.set("newMessageReceived", true)
	request.save(null, {
	  success: function(result) {
	  	res.success(result)
	  },
	  error: function(error) {
	  	res.error(error)
	  }
	});
})

