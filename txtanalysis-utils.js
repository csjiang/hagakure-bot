const Promise = require('bluebird');
const readFile = Promise.promisify(require('fs').readFile);
const appendFile = Promise.promisify(require('fs').appendFile);
const readdir = Promise.promisify(require('fs').readdir);
const unlink = Promise.promisify(require('fs').unlink);
const cleanAndSplit = require('./utils').parseText;

const filterByKeyword = (filenames, keyword) => {
	return filenames.filter((filename) => {
		return filename.includes(keyword);
	})
};

// non-recursively searches the given directory &
// returns an array of filenames filtered for the keyword string,
// reads chapter files asynchronously from that array & returns an array of promises
const createChapterPromises = (dirname, keyword) => {
	let promiseArray = [];
	return new Promise((resolve, reject) => { 
		readdir(dirname).then((files) => {
			filterByKeyword(files, keyword).map((chapter) => {
				promiseArray.push(readFile(dirname + chapter));
				});
			})
			.then(() => {
				resolve(promiseArray);
			})
			.catch(reject);
		});
};

// takes in an array of chapter-text buffers and writes each unparsed chapter, in order, to the filename supplied in the second parameter
const joinTextFiles = (chapterBuffers, fileToWrite) => {
	chapterBuffers.forEach((chapter) => {
		const text = chapter.toString();
		appendFile(fileToWrite, text).then(() => {
			console.log('The chapter text was appended to ' + fileToWrite + '!');
		})
		.catch((err) => {
			console.error('Error appending to file ' + fileToWrite);
		});
	});
};

// filters an array of strings for length
const removeShort = (tweetsArray, tooShort) => {
	return tweetsArray.filter((tweet) => {
		return tweet.length > tooShort;
	});
};

const getLongestTweet = tweetsArray => {
	return tweetsArray.reduce((tweet1, tweet2) => {
		return tweet1.length > tweet2.length ? tweet1 : tweet2;
	});
};

const getShortestTweet = tweetsArray => {
	return tweetsArray.reduce((tweet1, tweet2) => {
		return tweet1.length < tweet2.length ? tweet1 : tweet2;
	});
};

const getAvgLength = tweetsArray => {
	return (tweetsArray.map((tweet) => {
		return tweet.length;
	}).reduce((tweet1, tweet2) => {
		return tweet1 + tweet2; 
	}) / tweetsArray.length);
};

// parses and analyzes text
const parseText = (fileToParse, tooShort, tweetRate) => {
	readFile(fileToParse).then((fullText) => {
		const tweetsArray = cleanAndSplit(fullText.toString());
		const noShortTweets = removeShort(tweetsArray, tooShort);
		tweetStats(tweetsArray, noShortTweets, tweetRate);
	})
	.catch((err) => {
		console.error('Error reading or parsing file ' + fileToParse);
	});
};

// calculates and prints some simple figures for the given text, to aid in selecting tweet frequency and which lines to exclude 
const tweetStats = (tweetsArray, noShortTweets, tweetRate) => {
	console.log('First 30 tweets: ' + tweetsArray.slice(0, 30));
	console.log('Total tweets: ' + tweetsArray.length);
	console.log('Longest tweet: ' + getLongestTweet(noShortTweets) + ' ' + getLongestTweet(noShortTweets).length);
	console.log('Shortest tweet: ' + getShortestTweet(noShortTweets) + ' ' + getShortestTweet(noShortTweets).length);
	console.log('Average tweets length: ' +  getAvgLength(tweetsArray).toFixed(1) + ' chars');
	console.log('Total tweets (short lines removed): ' + noShortTweets.length);
	console.log('Days before running out of unique tweets, at a rate of one tweet every ' + tweetRate + ' minutes: ' + (tweetsArray.length / ((60 * 24) / tweetRate)).toFixed(1));
};

// deletes the concatenated text file when done
const removeFile = filename => {
	unlink(filename).then().catch((err) => {
		console.error('Error deleting file ' + filename);
	});
};

module.exports = { createChapterPromises, joinTextFiles, parseText, removeFile }