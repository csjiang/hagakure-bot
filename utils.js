const TwitterPackage = require('twitter');
const credentials = require('./credentials');
const Twitter = new TwitterPackage(credentials);

// sends a tweet if it exists
const sendWithTwitter = function(tweet) {
	if (tweet.length === 0) {
		return sendTweet();

	} else {
		console.log("Attempting to send tweet: " + tweet);

		Twitter.post('statuses/update', {
			status: tweet
		}, function(error, tweet, response) {

			if(error) {
				console.log("Error: " + error);
			}
			console.log("Successfully sent tweet");
		}); 
	}
};

// selects a chapter at random (12 chapters total) 
const pickChapter = function() {
	const chapterNums = [...Array(13).keys()].slice(1);
	chapterNums.splice(4, 1); // removes the fifth, textless chapter
	return chapterNums[Math.floor(Math.random() * chapterNums.length)];
};

// splits text into sentences and resolves deviant spacing
const parseText = function(text) {
	const sentenceEnd = /[\.\!\?](?: +|" )/g;
	return text.replace(/(?:\n|\f)+/g, ' ').replace(/- /g, '').replace(sentenceEnd, '$&<>').split('<>');
};

// picks a line at random; disqualifies very short lines
const generateTweet = function(linesArray) {
	let tweet = linesArray[Math.floor(Math.random() * linesArray.length)];
	if (tweet.length < 10) {
		return generateTweet(linesArray);
	} else return tweet;
};

// splits up long tweets and returns an array of shortened lines in order
const splitLongTweet = function(longTweet) {
	const numTweets = Math.ceil(longTweet.length / 134);
	let tweetsArray = []; 
	for (var i = 1; i <= numTweets; i++) {
		tweetsArray.push(longTweet.slice(0, 134) +  "(" + i + "/" + numTweets + ")");
		longTweet = longTweet.slice(134);
	}
	return tweetsArray;
};

module.exports = {
	sendWithTwitter: sendWithTwitter,
	pickChapter: pickChapter,
	parseText: parseText,
	generateTweet: generateTweet,
	splitLongTweet: splitLongTweet
};