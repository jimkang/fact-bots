// var config = require('./configs/config');
var callNextTick = require('call-next-tick');
var Twit = require('twit');
var async = require('async');
var getRandomArticle = require('get-random-article');
var getSentencesFromArticle = require('get-sentences-from-article');
var probable = require('probable');
var createFuckShitUp = require('fuck-shit-up').create;

var dryRun = false;
if (process.argv.length > 2) {
  dryRun = (process.argv[2].toLowerCase() == '--dry');
}

var attemptCount = 0;

var fuckShitUp = createFuckShitUp();

// var twit = new Twit(config.twitter);

function runWaterfall() {
  async.waterfall(
    [
      fetchArticle,
      getSentences,
      fuckSentencesUp,
      pickSentence,
      postTweet
    ],
    wrapUp
  );
}

function fetchArticle(done) {
  var opts = {
    language: 'en'
  };
  getRandomArticle(opts, done);
}

function getSentences(article, done) {
  var sentences = getSentencesFromArticle(article);
  if (!sentences || sentences.length < 1) {
    callNextTick(
      done, new Error('Could not get sentences from article: ' + article)
    );
  }
  else {
    // console.log('sentences:', sentences);
    callNextTick(done, null, sentences);
  }
}

function fuckSentencesUp(sentences, done) {
  async.map(sentences, fuckShitUp, done);
}

function pickSentence(sentences, done) {
  var shortSentences = sentences.filter(isUnder141Chars);
  shortSentences = shortSentences.filter(isLongEnough);
  var sentence = probable.pickFromArray(shortSentences);
  console.log('sentence:', sentence);
  callNextTick(done, null, sentence);
}

function postTweet(text, done) {
  if (dryRun) {
    console.log('Would have tweeted:', text);
    callNextTick(done);
  }
  else {
    var body = {
      status: text
    };
    twit.post('statuses/update', body, done);
  }
}

function isUnder141Chars(s) {
  return s.length < 141;
}

function isLongEnough(s) {
  return s.length > 8;
}

function wrapUp(error, data) {
  if (error) {
    console.log(error, error.stack);

    if (data) {
      console.log('data:', data);
    }

    if (attemptCount < 5) {
      console.log('Reattempting.');
      attemptCount += 1;
      callNextTick(runWaterfall);
    }
  }
}

runWaterfall();
