
const screenpackager = require('./support/screenpackager')
const userConfig = require('../../visualRegression/config')

let userSuites = userConfig.userConfig.suites;
var suitesKeys = Object.keys(userSuites);

suitesKeys.forEach(key => {
  userSuites[key] = "../../visualRegression/specs/" + userSuites[key]
})

console.log(userSuites)

let conf = {

  baseUrl: userConfig.userConfig.baseUrl,
  seleniumAddress: userConfig.userConfig.seleniumAddress,
  specs: [
    '../../visualRegression/specs/**/*.e2e.js'
  ],

  suites: userSuites,
  params: {
    //screenshots can be 'none', 'optional', or 'all'
    screenshots: 'all',
    //api is the vendor api call, none installed currently
    api: 'none',
    //local screenshots
    localscreenshots: 'enabled',
    //compare screenshots
    comparescreenshots: 'enabled',
    //width and height
    width: userConfig.userConfig.width,
    height: userConfig.userConfig.height,
    
    threshold: userConfig.userConfig.treshold,
    cooldown: userConfig.userConfig.cooldown
  },

  exclude: [],

  framework: 'jasmine',

  allScriptsTimeout: 110000,

  jasmineNodeOpts: {
    showTiming: true,
    showColors: true,
    isVerbose: true,
    includeStackTrace: false,
    defaultTimeoutInterval: 40000000
  },

  restartBrowserBetweenTests: true,

  SELENIUM_PROMISE_MANAGER: false,

  directConnect: false,

  //defaulting to chrome, but you can pass capabilities via cli
  capabilities: {
    'browserName': userConfig.userConfig.browser
  },

  maxSessions: 1,
  shardTestFiles: true,

  onPrepare: function () {
    process.env.BABEL_TARGET = 'node';
    process.env.IN_PROTRACTOR = 'true';
    require('@babel/register');

    screenpackager.screenPackager.packageRemove('screens')
    screenpackager.screenPackager.packageRemove('new')
    screenpackager.screenPackager.packageRemove('diffs')

    screenpackager.screenPackager.addCover('new')

  },

  onComplete: function () {
    screenpackager.screenPackager.packageScreenshots('screens')
    screenpackager.screenPackager.packageScreenshots('new')
    screenpackager.screenPackager.packageScreenshots('diffs')
  }
};

let browserOption = ""
let browserOptionName = ""

if (userConfig.userConfig.browserOptions){
  let browserOptions = userConfig.userConfig.browserOptions
  console.log(browserOptions)
  browserOptionName = Object.keys(browserOptions)[0]
  console.log(browserOptionName)
  browserOption = browserOptions[Object.keys(browserOptions)[0]]
  console.log(browserOption)
  conf.capabilities[browserOptionName] = browserOption
}

exports.config = {...conf}

