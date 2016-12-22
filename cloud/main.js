
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
	var jsonObj =  {date:getDate(), sender:sender, body:text}
	return jsonObj
}

Parse.Cloud.define("saveNewRequest", function(req, res){
	var user = req.params.user
	var messageBody = req.params.message
	var subject = req.params.subject
	var request = new Request()
	var message = messageJSON(messageBody, "user")
	request.set("from", user)
	request.set("subject", subject)
	request.set("conversation", [message])
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

Parse.Cloud.define("sendMessageToRequestID", function(req, res){
	console.log("sendMessageToRequestID > CALLED")
	var requestID = req.params.requestID
	var messageBody = req.params.messageBody
	var sender = req.params.sender
	var message = messageJSON(messageBody, sender)
	var retrieveWithID = new Parse.Query(Request)
	retrieveWithID.get(requestID, {
	  success: function(result) {
	  	console.log("getRequestWithID > " + requestID + " FOUND")
	  	console.log(JSON.stringify(result))
	  	var oldConversation = result.get("conversation")
	  	var newConversation = new Array()
	  	newConversation = oldConversation
	  	newConversation.push(message)
	  	console.log("OLD CONVERSATION > " + JSON.stringify(oldConversation))
	  	result.set("conversation", newConversation)
	  	result.save(null, {
	  	  success: function(result) {
	  	  	console.log("New conversation > SAVED")
		  	res.success(result)
		  },
		  error: function(object, error) {
		  	res.error(error)
		  }	
	  	})
	  },
	  error: function(error) {
	    res.error(error);
	  }
	});
})

// getRequestList output:
/*
{
    requestTitle: String,
    fromUserCompleteName: String,
    fromUserCountry: String,
    lastMessagePreview(250): String,
    status: String
    newMessageReceived: boolean
}
*/

Parse.Cloud.define("getRequestList", function(req, res){
	console.log("getRequestList > CALLED")
	var query = new Parse.Query('Request'); 
	var output = new Array()
	query.notEqualTo("status", "archived");
	query.include("from")
	query.find({
	  success: function(results) {
	  	console.log("getRequestList > FOUND " + results.length + " OBJECTS")
	  	for(request in results){
	  		console.log("index")
	  		var title = request.get("subject")
	  		var from = request.get("from")
	  		var fromCountry = from.get("country")
	  		var fromCompleteName = from.get("completeName")
	  		var conversationArray = request.get("conversation")
	  		var lastMessage = conversationArray[conversationArray.length - 1]
	  		var status = request.get("status")
	  		var notification = request.get("newMessageReceived")
	  		var object = {
			    requestTitle: title,
			    fromUserCompleteName: fromCompleteName,
			    fromUserCountry: fromCountry,
			    lastMessagePreview: lastMessage,
			    status: status,
			    newMessageReceived: notification
			}
			output.push(object)
	  	}
	    res.success(output)
	  },
	  error: function(error) {
	    res.error(error);
	  }
	});
})
