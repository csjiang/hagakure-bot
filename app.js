const utils = require('./utils');
const generateTweet = utils.generateTweet;
const readChapter = utils.readChapter;
const tweetFromPipeline = utils.tweetFromPipeline;

let tweetsWaiting = [];

const sendTweet = () => {

	// tweets from pipeline if it exists
	if (tweetsWaiting.length > 0) return tweetFromPipeline(tweetsWaiting);
	else {
		// read a chapter, parse text into sentences; generate tweet and pipe it in
		return readChapter().then((contents) => {
			tweetsWaiting = generateTweet(contents);
			return sendTweet();
		});
	}
};

const scheduleTweets = tweetRate => {
	return setInterval(() => {
	  sendTweet();
	}, tweetRate * 60 * 1000);
};

// sends one tweet to start, and subsequently tweets once per 10 minutes while the process is running
sendTweet();
scheduleTweets(10);
