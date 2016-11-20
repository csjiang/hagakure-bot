const Promise = require('bluebird');
const createChapterPromises = require('./txtanalysis-utils').createChapterPromises;
const joinTextFiles = require('./txtanalysis-utils').joinTextFiles;
const parseText = require('./txtanalysis-utils').parseText;
const removeFile = require('./txtanalysis-utils').removeFile;

// NB: This file runs the final analysis. Please see txtanalysis-utils.js for a breakdown of how this is done, and to further customize parsing & analysis parameters.

const analyzeText = (chapterPromises, filename, tooShort, tweetRate, tweetsToShow) => {
	Promise.all(chapterPromises).then((readChapters) => {
		joinTextFiles(readChapters, filename);
	})
	.then(() => {
		parseText(filename, tooShort, tweetRate, tweetsToShow);
	})
	.then(() => {
		removeFile(filename);
	})
	.catch((err) => {
		console.log("Error analyzing file " + filename);
	});
};

// First, the createChapterPromises utility function reads in text files from the directory given in the first arg, filtered for files containing the keyword given in the second arg. 
	// const chapters = createChapterPromises('./path/to/textfiles', 'keywordToFilterBy')

// Then, analyzeText takes in an array of chapter-reading promises and writes them to the filename supplied in the second parameter. 
// subsequently, it cleans and parses the joined text and logs out some figures about the final set of tweets, including:
	// the number of total tweets, 
	// number of tweets longer than the # of characters specified in tooShort, 
	// average tweet length, and 
	// how long it takes to run out of unique tweets when tweeting once per tweetRate minutes. 
// analyzeText will remove the concatenated text file once it is finished, so you can change analysis parameters between executions without writing redundantly to the same file. 

// example: 
const chapters = createChapterPromises('./hagakure/', 'chapter');
analyzeText(chapters, 'fulltext.txt', 10, 5, 30);