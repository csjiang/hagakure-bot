const TwitterPackage = require('twitter');
const credentials = require('./credentials');
const Twitter = new TwitterPackage(credentials);
const Promise = require('bluebird');
const readFile = Promise.promisify(require('fs').readFile);

// sends a tweet if it exists
const sendWithTwitter = tweet => {
	console.log("Attempting to send tweet: " + tweet);

	Twitter.post('statuses/update', {
		status: tweet
	}, (error, tweet, response) => {

		if (error) console.log("Error occurred: ", response);
		else console.log("Successfully sent tweet at " + new Date());
	}); 
};

// For testing without triggering rate limiting by Twitter API
// const sendWithTwitter = tweet => {
// 	console.log("Sending tweet: " + tweet);
// };

// generates a random element of array 
const pickRandom = someArray => {
	return someArray[Math.floor(Math.random() * someArray.length)];
};

// clears the pipeline of tweets waiting.
const tweetFromPipeline = tweetPipeline => {
	while (tweetPipeline.length > 0) {
		sendWithTwitter(tweetPipeline.shift());
	}
};

// selects a chapter at random (12 chapters total) 
const pickChapter = () => {
	let chapterNums = [...Array(13).keys()].slice(1);
	chapterNums.splice(4, 1); // removes the fifth, textless chapter
	return pickRandom(chapterNums);
};

// selects a chapter at random and returns the parsed text as a promise
const readChapter = () => {
	const chapter = pickChapter();
	return new Promise((resolve, reject) => { 
		let hagakureLines;
		readFile('./hagakure/chapter-' + chapter + '.txt')
			.then((contents) => {
				hagakureLines = parseText(contents.toString());
			})
			.then(() => {
				resolve(hagakureLines);
			})
			.catch(reject);
	});
};

// splits text into sentences and resolves deviant spacing
const parseText = text => {
	// the massive regex below basically defines a sentence as anything ending with [?.!]. 
	// however, when there is a quote in the middle of a sentence and a [?.!] within the quote, the sentence does not end until
	// a [?.!] and closing quotations. The quantifiers at the end allow for processing parentheticals and ellipses. 
	const sentence = /(?:(?=[^?.!]*"\b[^"]*[?.!])\s[^?.!]*"[^"]*[?.!]"|(?![^?.!]"[^"]*[?.!])[^?.!]*[?.!][.)]{0,2})/g;
	// the string replacements clean up idiosyncrasies in the text files I have. 
	return text.replace(/(?:\n|\f)+/g, ' ').replace(/(?:- | +•)/g, '').replace(/[\u201c\u201d]/g, '"').match(sentence);
};

// picks a line at random; disqualifies very short lines and returns an updated tweet pipeline array 
const generateTweet = tweetsArray => {
	let tweet = pickRandom(tweetsArray);
	if (tweet.length < 20) return generateTweet(tweetsArray);
	else if (tweet.length > 140) return splitLongTweet(tweet);
	else return [tweet];
};

// splits up long tweets and returns an array of shortened lines in order
const splitLongTweet = (longTweet) => {
	const numTweets = Math.ceil(longTweet.length / 133);
	let tweetsForPipeline = []; 
	for (let i = 1; i <= numTweets; i++) {
		tweetsForPipeline.push(longTweet.slice(0, 133) +  "(" + i + "/" + numTweets + ")");
		longTweet = longTweet.slice(133);
	}
	return tweetsForPipeline;
};

module.exports = { generateTweet, readChapter, tweetFromPipeline, parseText };