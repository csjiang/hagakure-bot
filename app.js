const Promise = require('bluebird');
const readFile = Promise.promisify(require('fs').readFile);

const utils = require('./utils');
const sendWithTwitter = utils.sendWithTwitter;
const pickChapter = utils.pickChapter;
const parseText = utils.parseText;
const generateTweet = utils.generateTweet;
const splitLongTweet = utils.splitLongTweet;

let tweetsWaiting = [];

const sendTweet = () => {

	// tweets from pipeline if it exists
	if (tweetsWaiting.length > 0) {
		const theTweet = tweetsWaiting.shift();
		sendWithTwitter(theTweet);

	} else {
		const chapter = pickChapter();
		const readingHagakure = readFile('./hagakure/chapter-' + chapter + '.txt');
		let hagakureLines, tweet; 

		// after reading a chapter, format the text and split into sentences		
		readingHagakure.then((contents) => {
			hagakureLines = parseText(contents.toString());
		})
		.then(() => {

			tweet = generateTweet(hagakureLines);

			if (tweet.length > 140) {
				tweetsWaiting = tweetsWaiting.concat(splitLongTweet(tweet));
				return sendTweet();
			} else sendWithTwitter(tweet);
		})
		.catch((err) => {
			console.log("Error reading file", err);
		});
	}
};

// sends one tweet to start, and subsequently tweets once every 5 minutes
sendTweet();
setInterval(() => {
  sendTweet();
}, 5 * 60 * 1000); 