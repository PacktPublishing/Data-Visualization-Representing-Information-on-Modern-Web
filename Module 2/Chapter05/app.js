var _ = require("underscore");
var express = require("express");
var OAuth = require('oauth');
var app = express();
app.configure(function() {
	app.use(express.bodyParser());
	app.use(express.cookieParser() );
	app.use(express.session({ secret: "a secret key"}));
	app.use(express.static(__dirname + '/public'));
	app.use(app.router);
});

function getOAuth()
{
 	var twitterOauth = new OAuth.OAuth(
      'https://api.twitter.com/oauth/request_token',
      'https://api.twitter.com/oauth/access_token',
      'XVz1FIUI2Chzv857d6Xcw',
      'QWOPUoApZDKT9X7ZSth3HsE5uFwur6GrSR59d3T7Dk',
      '1.0A',
      null,
      'HMAC-SHA1'
    );
 	return twitterOauth;
}



app.get('/requestOAuth', function(req, res)
{
	function recieveOAuthRequestTokens(error, oauth_token, oauth_token_secret,results) {
		if (error) return console.log('getOAuthRequestToken Error', error);
		console.log("Got token " + oauth_token);
		console.log("Got secret token " + oauth_token_secret);
		req.session.oAuthVars = { oauth_token: oauth_token,
								  oauth_token_secret: oauth_token_secret};
		res.redirect('https://api.twitter.com/oauth/authorize?oauth_token=' + oauth_token);
	}
	requestOAuthRequestTokens(recieveOAuthRequestTokens);
});

function requestOAuthRequestTokens(onComplete)
{
	var oauth = getOAuth();
 	oauth.getOAuthRequestToken(onComplete);
}

app.get('/recieveOAuth', function(req, res)
{
	if(!req.session.oAuthVars)
	{
		console.log("No session information found");
		res.redirect("/requestOAuth");
		return;
	}
	if(!req.session.oAuthVars.oauth_access_token)
	{
		var oa = getOAuth();
		oa.getOAuthAccessToken(req.session.oAuthVars.oauth_token, req.session.oAuthVars.oauth_token_secret, req.param('oauth_verifier'),
		function(error, oauth_access_token,oauth_access_token_secret, tweetRes) {
			req.session.oAuthVars.oauth_access_token = oauth_access_token;
			req.session.oAuthVars.oauth_access_token_secret = oauth_access_token_secret;
			req.session.twitterVars = {
				user_id: tweetRes.user_id,
				screen_name: tweetRes.screen_name
			};
			if (error) {
				console.log("Unable to get token");
				console.log('getOAuthAccessToken error: ', error);
				res.redirect("/requestOAuth");
				return;
			}
			console.log("User ID: " + tweetRes.user_id);
			console.log("User Name: " + tweetRes.screen_name);
			console.log("Access Token: " + oauth_access_token);
			console.log("Access Token Secret: " + oauth_access_token_secret);
			res.redirect("/html/twitter.html");
		});
	}
	else
	{
		res.redirect("/html/twitter.html");
	}
});

app.get('/friends', function(req, res)
{
	if(!req.session.oAuthVars || !req.session.oAuthVars.oauth_access_token)
	{
		res.redirect('/requestOAuth');
		return;
	}
	res.setHeader('Content-Type', 'application/json');
	var cursor = -1;
	ReceiveUserListPage(res, req.session.twitterVars.user_id, req.session.oAuthVars.oauth_access_token, req.session.oAuthVars.oauth_access_token_secret, cursor, new Array());
});

function ReceiveUserListPage(res, user_id, oauth_access_token, oauth_access_token_secret, currentCursor, fullResults){
	var oauth = getOAuth();
	oauth.get(
		'https://api.twitter.com/1.1/friends/list.json?skip_status=true&user_id=' + user_id + "&cursor=" + currentCursor,
		oauth_access_token, 
		oauth_access_token_secret,
		function (e, data, oaRes){
			var jsonData = JSON.parse(data);
			if(jsonData.errors)
			{
				console.log(require('util').inspect(jsonData));
				projectResults(res, fullResults);
				return;
			}
			fullResults = _.union(fullResults, _.map(jsonData.users, function(item){return { name: item.name, count: item.statuses_count }}));
			if(jsonData.next_cursor == 0){
				projectResults(res, fullResults);
  			}
  			else{
  				console.log("Getting next cursor: " + jsonData.next_cursor);
  				ReceiveUserListPage(res, user_id, oauth_access_token, oauth_access_token_secret, jsonData.next_cursor, fullResults);
  			}
		});
}

function projectResults(res, fullResults)
{
	var selectedResults = _.first(_.sortBy(fullResults, function(item){return item.count;}).reverse(), 10);
	res.end(JSON.stringify(selectedResults));
}

function GetMentions(res, oauth_access_token, oauth_access_token_secret)
{
	var oauth = getOAuth();
	oauth.get(
		'https://api.twitter.com/1.1/statuses/mentions_timeline.json',
		oauth_access_token, 
		oauth_access_token_secret,
		function (e, data, oaRes){
			res.setHeader('Content-Type', 'application/json');
			res.setHeader('Content-Length', data.length);
  			res.end(data);
			});
}

app.listen(8080);
console.log("Listening on port 8080");