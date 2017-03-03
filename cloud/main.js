// EAS - API
// Developed by Giuseppe Capoluongo 2k16 CC

// global
var User = Parse.Object.extend("User")
var Service = Parse.Object.extend("Service");
var SubService = Parse.Object.extend("SubService");
var ExtraService = Parse.Object.extend("ExtraService");
var Request = Parse.Object.extend("Request");
var Appointment = Parse.Object.extend("Appointment");

Parse.Cloud.define('hello', function(req, res) {
    res.success('Hi');
});


// v 1.0
/*
getSeviceList() > list all services enabled as json ["id":"", "title":"", "shortDescription":"", "imageURL":"", "imageAlt":""]
getServiceWithID(objectID: String) > PFObject
*/

Parse.Cloud.define("getServiceList", function(req, res) {
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

// get featured for home page

Parse.Cloud.define("getFeaturedServiceList", function(req, res) {
    console.log("getFeaturedServiceList > CALLED")
    var retrieveAll = new Parse.Query(Service)
    retrieveAll.equalTo("enabled", true);
    retrieveAll.equalTo("featured", true);
    retrieveAll.limit = 6
    retrieveAll.find({
        success: function(results) {
            console.log("getFeaturedServiceList > FOUND " + results.length + " OBJECTS")
            res.success(results)
        },
        error: function(error) {
            res.error(error);
        }
    });
})

Parse.Cloud.define("getServiceWithID", function(req, res) {
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
Date.prototype.today = function() {
    return ((this.getDate() < 10) ? "0" : "") + this.getDate() + "/" + (((this.getMonth() + 1) < 10) ? "0" : "") + (this.getMonth() + 1) + "/" + this.getFullYear();
}

// For the time now
Date.prototype.timeNow = function() {
    return ((this.getHours() < 10) ? "0" : "") + this.getHours() + ":" + ((this.getMinutes() < 10) ? "0" : "") + this.getMinutes() + ":" + ((this.getSeconds() < 10) ? "0" : "") + this.getSeconds();
}

function getDate() {
    return new Date().today() + " @ " + new Date().timeNow();
}

function messageJSON(text, sender) {
    var jsonObj = {
        date: getDate(),
        sender: sender,
        body: text
    }
    return jsonObj
}

function getUser(userId) {
    Parse.Cloud.useMasterKey();
    var userQuery = new Parse.Query(Parse.User);
    userQuery.equalTo("objectId", userId);
    //Here you aren't directly returning a user, but you are returning a function that will sometime in the future return a user. This is considered a promise.
    return userQuery.first({
        success: function(userRetrieved) {
            //When the success method fires and you return userRetrieved you fulfill the above promise, and the userRetrieved continues up the chain.
            return userRetrieved;
        },
        error: function(error) {
            return error;
        }
    });
};

Parse.Cloud.define("saveNewRequest", function(req, res){
	var userId = req.params.user
	var messageBody = req.params.message
	var subject = req.params.subject
	var request = new Request()
	var message = messageJSON(messageBody, "user")
    getUser(userId).then(function(user){
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
        },
        function(error){
            response.error(error);
        }
    );
});

Parse.Cloud.define("saveNewRequestWithoutUser", function(req, res) {
    var messageBody = req.params.message
    var subject = req.params.subject
    var request = new Request()
    var message = messageJSON(messageBody, "user")
    request.set("subject", subject)
    request.set("conversation", [message])
    request.set("status", "disabled")
    request.set("newMessageReceived", true)
    request.save(null, {
        success: function(result) {
            res.success(result)
        },
        error: function(error) {
            res.error(error)
        }
    });
});

Parse.Cloud.define("sendMessageToRequestID", function(req, res) {
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
    fromUserId: String,
    fromUserCountry: String,
    lastMessagePreview(250): String,
    status: String
    newMessageReceived: boolean
}
*/

Parse.Cloud.define("getRequestList", function(req, res) {
    console.log("getRequestList > CALLED")
    var query = new Parse.Query('Request');
    var output = new Array()
    query.notEqualTo("status", "archived");
    query.include("from")
    query.find({
        success: function(results) {
            console.log("getRequestList > FOUND " + results.length + " OBJECTS")
            // console.log(JSON.stringify(results))
            for (request of results) {
                title = request.get("subject")
                from = request.get("from")
                // fromCountry = from.get("country")
                fromCountry = "Italy"
                // fromCompleteName = from.get("completeName")
                fromCompleteName = "Giuseppe Vrenna"
                conversationArray = request.get("conversation")
                lastMessage = conversationArray[conversationArray.length - 1]
                status = request.get("status")
                notification = request.get("newMessageReceived")
                console.log(title + status + notification + lastMessage)
                var object = {
                    requestTitle: title,
                    fromUserCompleteName: fromCompleteName,
                    fromUserCountry: fromCountry,
                    fromUserId: "c68myjc1AX",
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

Parse.Cloud.define("getRequestForUserWithID", function(req, res) {
    var userId = req.params.userId
    getUser(userId).then(function(user) {
            var query = new Parse.Query("Request")
            query.equalTo("from", user)
            query.limit = 1
            query.find({
                success: function(result) {
                    res.success(result)
                },
                error: function(error) {
                    res.error(error)
                }
            })
        },
        function(error) {
            res.error(error)
        })
})


Parse.Cloud.define("getChatForUserWithID", function(req, res) {
    var userId = req.params.userId
    getUser(userId).then(function(user) {
            var query = new Parse.Query("Request")
            query.equalTo("from", user)
            query.limit = 1
            query.find({
                success: function(result) {
                    res.success(result[0].get("conversation"))
                },
                error: function(error) {
                    res.error(error)
                }
            })
        },
        function(error) {
            res.error(error)
        })
})

var availableHours = ["8:00", "8:15", "8:30", "8:45", "9:00"]

Parse.Cloud.define("createAppointment", function(req, res) {
  var name = req.params.name
  var tel = req.params.telephone
  var date = req.params.date
  var hour = req.params.hour

  var appointment = new Appointment()
  appointment.set("name", name)
  appointment.set("telephone", tel)
  appointment.set("date", date)
  appointment.set("hour", hour)
  appointment.save(null, {
      success: function(result) {
          res.success(result)
      },
      error: function(error) {
          res.error(error)
      }
  });
})

Parse.Cloud.define("getAvailableHoursForDate", function(req, res) {
  var date = req.params.date
  var query = new Parse.Query("Appointment")
  query.equalTo("date", date)
  query.find({
      success: function(result) {
          var hoursNotAvailable = []
          for (object of result) {
            var hour = object.get("hour")
            hoursNotAvailable.push(hour)
          }
          var response = new Set([...availableHours].filter(x => !hoursNotAvailable.has(x)))
          res.success(response)
      },
      error: function(error) {
          res.error(error)
      }
  })
})

function getTodayDateCustomObject(){
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth()+1;
  var yyyy = today.getFullYear();
  var customDateObj = {
    day: dd,
    month: mm,
    year: yyyy
  }
  return customDateObj;
}

Parse.Cloud.define("getAllAppointmentsForToday", function(req, res) {
  var date = getTodayDateCustomObject()
  var query = new Parse.Query("Appointment")
  query.equalTo("date", date)
  query.find({
      success: function(result) {
          res.success(result)
      },
      error: function(error) {
          res.error(error)
      }
  })
})
