const TwitterPackage = require('twitter');
const credentials = require('./credentials');
const Twitter = new TwitterPackage(credentials);

// sends a tweet if it exists
const sendWithTwitter = tweet => {
	if (tweet.length === 0) return sendTweet();
	else {
		console.log("Attempting to send tweet: " + tweet);

		Twitter.post('statuses/update', {
			status: tweet
		}, (error, tweet, response) => {

			if (error) console.log("Error occurred: ", response);
			else console.log("Successfully sent tweet at " + new Date());
		}); 
	}
};

// selects a chapter at random (12 chapters total) 
const pickChapter = () => {
	let chapterNums = [...Array(13).keys()].slice(1);
	chapterNums.splice(4, 1); // removes the fifth, textless chapter
	return chapterNums[Math.floor(Math.random() * chapterNums.length)];
};

// splits text into sentences and resolves deviant spacing
const parseText = text => {
	const sentenceEnd = /[\.\!\?](?: +|" )/g;
	return text.replace(/(?:\n|\f)+/g, ' ').replace(/- /g, '').replace(sentenceEnd, '$&<>').split('<>');
};

// picks a line at random; disqualifies very short lines
const generateTweet = linesArray => {
	let tweet = linesArray[Math.floor(Math.random() * linesArray.length)];
	if (tweet.length < 10) return generateTweet(linesArray);
	else return tweet;
};

// splits up long tweets and returns an array of shortened lines in order
const splitLongTweet = longTweet => {
	const numTweets = Math.ceil(longTweet.length / 133);
	let tweetsArray = []; 
	for (let i = 1; i <= numTweets; i++) {
		tweetsArray.push(longTweet.slice(0, 133) +  "(" + i + "/" + numTweets + ")");
		longTweet = longTweet.slice(133);
	}
	return tweetsArray;
};

module.exports = { sendWithTwitter, pickChapter, parseText, generateTweet, splitLongTweet };