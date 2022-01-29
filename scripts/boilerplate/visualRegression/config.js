let userConfig = {

    baseUrl: `http://www.google.com`,
    seleniumAddress: 'http://127.0.0.1:4444/wd/hub',

    suites: {
        example: "example/*.e2e.js"
    },

    width: 1024,
    height: 768,

    treshold: 0.1,
    //this is the treshold for matching diffs. It accepts numbers 0 to 1, with 0 being the most sensitive, and 1 being the least sensitive.

    browser: 'chrome',
    //other options: 'firefox', 'internet explorer', 'safari'

    //optional: include browser specific options
    browserOptions: {
        'chromeOptions': {
            'excludeSwitches': ['enable-automation']
        }
    },

    //cooldown between steps
    cooldown: 500
}

module.exports = {
    userConfig
}
