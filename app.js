const Promise = require('bluebird');
const readFile = Promise.promisify(require('fs').readFile);

const utils = require('./utils');
const sendWithTwitter = utils.sendWithTwitter;
const pickChapter = utils.pickChapter;
const parseText = utils.parseText;
const generateTweet = utils.generateTweet;
const splitLongTweet = utils.splitLongTweet;

let tweetsWaiting = [];

const sendTweet = (/*succeed, fail*/) => {

	// tweets from pipeline if it exists
	if (tweetsWaiting.length > 0) {
		const theTweet = tweetsWaiting.shift();
		return sendWithTwitter(theTweet);

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
			} else {
				sendWithTwitter(tweet);
				//succeed("success");
			}
		})
		.catch((err) => {
			console.log("Error reading file", err);
			//fail(err);
		});
	}
};

// sends one tweet to start, and subsequently tweets once every 5 minutes
sendTweet();
setInterval(() => {
  sendTweet();
}, 10 * 60 * 1000); 

// exports.handler = (event, context) => {
// 	sendTweet(context.succeed, context.fail);
// };