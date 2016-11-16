const TwitterPackage = require('twitter');
const credentials = require('./credentials');
//create a file credentials.js with format: module.exports = {
//   consumer_key: '***',
//   consumer_secret: '***',
//   access_token_key: '***',
//   access_token_secret: '***'
// };
const Twitter = new TwitterPackage(credentials);
const Promise = require('bluebird');
const readFile = Promise.promisify(require('fs').readFile);

const numArray = [...Array(13).keys()].slice(1);
numArray.splice(4, 1);
let chapter = numArray[Math.floor(Math.random() * numArray.length)];
const readingHagakure = readFile('./hagakure/chapter-' + chapter + '.txt');

let hagakureLines, tweet; 
const sentenceEnd = /[\.\!\?](?: +|" )/g;

//replace weird characters: replace(/[^\x00-\x7F]/, '').


setInterval(function() {
  sendTweet();
}, 5 * 60 * 1000); //tweets every 5 minutes

//after picking a chapter, format the text and split into sentences
const sendTweet = function() {
	readingHagakure.then(function(contents) {
		hagakureLines = contents.toString().replace(/(?:\n|\f)+/g, ' ').replace(/- /g, '').replace(sentenceEnd, '$&<>').split('<>');
		// console.log(hagakureLines);
	})
	.then(function() {
		const generateTweet = function() {
			//picks a line at random
			tweet = hagakureLines[Math.floor(Math.random() * numArray.length)];
		};
		generateTweet();
		while (tweet.length < 5 || tweet.length > 140) {
			generateTweet();
		} 
		// if (tweet.length > 140) {
		// 	//split up and put into tweet pipeline
		// }
		// Twitter.post('statuses/update', {status: tweet}, function(error, tweet, response) {
		// 	if(error) {
		// 		console.log(error);
		// 	}
		// 	console.log(tweet);
		// 	console.log(response);
		// });
	})
	.catch(function(err) {
		console.log("Error reading file", err);
	});
};

