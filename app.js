const TwitterPackage = require('twitter');
const credentials = require('./credentials');
	// To use, supply a file credentials.js with format: 
	// module.exports = {
	//    consumer_key: '***',
	//    consumer_secret: '***',
	//    access_token_key: '***',
	//    access_token_secret: '***'
	//  };
const Twitter = new TwitterPackage(credentials);
const Promise = require('bluebird');
const readFile = Promise.promisify(require('fs').readFile);

const sendWithTwitter = function(tweet) {

	Twitter.post('statuses/update', {
		status: tweet
	}, function(error, tweet, response) {

	if(error) {
		console.log(error);
	}
	console.log("Successfully sent tweet: " + tweet);
	}); 
};

let tweetsWaiting = [];

const sendTweet = function() {

	// tweets from pipeline if it exists
	if (tweetsWaiting.length > 0) {
		const theTweet = tweetsWaiting.pop();
		sendWithTwitter(theTweet);

	} else {

		// read in a random Hagakure chapter (12 chapters total)
		const numArray = [...Array(13).keys()].slice(1);
		numArray.splice(4, 1); // removes the fifth, textless chapter
		let chapter = numArray[Math.floor(Math.random() * numArray.length)];
		const readingHagakure = readFile('./hagakure/chapter-' + chapter + '.txt');
		
		// after picking a chapter, format the text and split into sentences
		let hagakureLines, tweet; 
		const sentenceEnd = /[\.\!\?](?: +|" )/g;

		readingHagakure.then(function(contents) {
			hagakureLines = contents.toString().replace(/(?:\n|\f)+/g, ' ').replace(/- /g, '').replace(sentenceEnd, '$&<>').split('<>');
			//console.log(hagakureLines);
		})
		.then(function() {

			const generateTweet = function() {
				// picks a line at random
				tweet = hagakureLines[Math.floor(Math.random() * numArray.length)];
			};

			generateTweet();

			while (tweet.length < 5) {
				generateTweet();
			} 

			// splits up long tweets and pipes them into tweetsWaiting in order
			if (tweet.length > 140) {
				while (tweet.length > 140) {
					let firstTweet = tweet.slice(0, 140);
					tweetsWaiting.push(firstTweet);
					tweet = tweet.slice(140);
				}
				return tweetsWaiting.push(tweet);
			}

			sendWithTwitter(tweet);

			})
			.catch(function(err) {
				console.log("Error reading file", err);
			})
		}
	};

sendTweet();
setInterval(function() {
  sendTweet();
}, 5 * 60 * 1000); // tweets every 5 minutes