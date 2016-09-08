// Additional JS functions here
  window.fbAsyncInit = function() {
    FB.init({
      appId      : '525498037499491', // App ID
      channelUrl : '//localhost:8080/channel', // Channel File
      status     : true, // check login status
      cookie     : true, // enable cookies to allow the server to access the session
      xfbml      : true  // parse XFBML
    });
    console.log("Init complete");
    FB.Event.subscribe('auth.authResponseChange', function(response) {
      if (response.status === 'connected') {
        console.log("Already logged in");
        retrieveDevices();
      } else if (response.status === 'not_authorized') {
        console.log("not authorized");
        FB.login({scope: "user_birthday,user_relationship_status,email,friends_birthday"});
      } else {
        console.log("not logged in");
        FB.login({scope: "user_birthday,user_relationship_status,email"});
      }
    });
  };

  // Load the SDK asynchronously
  (function(d){
     var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
     if (d.getElementById(id)) {return;}
     js = d.createElement('script'); js.id = id; js.async = true;
     js.src = "//connect.facebook.net/en_US/all.js";
     ref.parentNode.insertBefore(js, ref);
   }(document));

  function testAPI()
  {
    console.log("Login retrieved");
    FB.api('/me', function(response)
    {
      console.log("Login is for " + response.name);
    });
  }

  var operatingSystems = [{"os": "android", users: 0}, 
                          {"os": "apple", users: 0}];
  function retrieveDevices()
  {
    console.log("Fetching devices");
    FB.api('/me?fields=friends.fields(devices)', function(response)
    {
      for(i = 0; i<response.friends.data.length; i++)
      {
        if(response.friends.data[i].devices)
          for(j = 0; j< response.friends.data[i].devices.length; j++)
            if(response.friends.data[i].devices[j].hardware != "iPad")
            {
              if(response.friends.data[i].devices[j].os == "Android")
                operatingSystems[0].users++;
              else
                operatingSystems[1].users++;
            }
      }
      renderSVG();
      
    });
  }

  function renderSVG()
  {
    var visualization = d3.select("#visualization");
    visualization.selectAll(".logo").data(operatingSystems).enter().append("use")
      .attr("xlink:href", function(item){ return "#" + item.os + "Logo";})
      .attr("transform", function(item, index){
        return "translate("  + 300 * index + " 0),scale(" + (item.users / operatingSystems[0].users) + ")";
      });
    visualization.selectAll(".key").data(operatingSystems).enter().append("text")
      .text(function(item){return item.os;})
      .attr("text-anchor", "middle")
      .attr("x", function(item, index){ return (index * 300 )+ (128 * (item.users / operatingSystems[0].users));})
      .attr("y", 350)
      .attr("font-size", 50);
    visualization.selectAll(".key").data(operatingSystems).enter().append("text")
      .text(function(item){return item.users;})
      .attr("text-anchor", "middle")
      .attr("x", function(item, index){ return (index * 300 )+ (128 * (item.users / operatingSystems[0].users));})
      .attr("y", 385)
      .attr("font-size", 30);
  }