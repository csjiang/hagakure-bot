# hagakure-bot

> "Tether even a roasted chicken." 

> Yamamoto Tsunetomo, *Hagakure*

![Image of Hagakure Seal](http://www.cazurrabit.com/041001/diario/img/hagakure.jpg)

Simple node.js twitter bot that retweets random lines from the Hagakure (Way of the Samurai) by Yamamoto Tsunetomo.

1. `npm install` from the root directory
2. download hagakure chapter .txt files from https://github.com/hollanddd/hagakure 
3. supply a file credentials.js with format: 
    `module.exports = {
      consumer_key: '***',
      consumer_secret: '***',
      access_token_key: '***',
      access_token_secret: '***'
      };`
4. in bash shell, run `nodemon app`
5. enjoy and grow wise