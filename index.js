const protractor = require('protractor');
const screenshotter = require("./support/screenAndApi");
var fs = require('fs');
var path = require('path');
let expansionsDir = "../../visualRegression/expansions/"

let coolDown = protractor.browser.params.cooldown;

let screenCount = 0;

let expansions = {}
let expansionModules = []

fs.readdirSync(path.join(__dirname, expansionsDir)).forEach((file, index) => {
    expansions[index] = require(expansionsDir + file.split('.')[0])
    expansionModules.push(expansions[index])
});


//main loop

const runTest = async function (test) {

    let testID = test.testName + " - screenshots: " + protractor.browser.params.screenshots

    describe(testID, function () {

        beforeEach(async () => {

            let browserType = ""
            protractor.browser.getCapabilities().then(function (caps) {
                browserType = caps.get("browserName")
                screenshotter.clearDirectory(browser, browserType + " " + protractor.browser.params.width + "x" + protractor.browser.params.height, test.testName)
            });

            console.log("Starting Test: " + testID)
        });

        it("Get snapshots of app - " + test.testName, async () => {

            let browserType = ""
            protractor.browser.getCapabilities().then(function (caps) {
                browserType = caps.get("browserName")
            });

            // Open a chrome protractor.browser.
            protractor.browser.ignoreSynchronization = true

            protractor.setViewportSize = function (width, height) {
                const JS_GET_PADDING = "return {"
                    + "w: window.outerWidth - window.innerWidth,"
                    + "h: window.outerHeight - window.innerHeight };";

                browser.executeScript(JS_GET_PADDING).then(function (pad) {
                    browser.manage().window().setSize(width + pad.w, height + pad.h);
                });
            };

            await protractor.setViewportSize(protractor.browser.params.width, protractor.browser.params.height);

            for (let i = 0; i < test.testScript.length; i++) {

                //reset the screencount at the start of each loop
                if (i === 0) {
                    screenCount = 0;
                }

                //deep copy the current item into slug
                let slug = { ...test.testScript[i] };

                //actual methods start now
                if (localMethods[slug.type] !== undefined) {
                    await localMethods[slug.type](browser, slug, slug.screenshotName, test.testName).then(callback => {
                        console.log(callback)
                    })
                } else {
                    console.log('checking expansions for method ' + slug.type)
                    //check through expansion module methods
                    for (let m = 0; m < expansionModules.length; m++) {
                        screenCount = await expansionModules[m].expansionModule(slug, test, browser, coolDown, screenCount)
                    }
                }
            }
        });

        afterEach(async () => {
            console.log("Completed Test: " + testID)
            protractor.browser.close();
        });
    });
}
//navigation methods:
const localMethods = {
    async url(browser, slug, screenshotName, folder) {

        screenCount = await screenshotter.countScreenshots(screenshotName, browser, screenCount)
        //await protractor.browser.loadAndWaitForAureliaPage(`http://localhost:${config.port}` + slug.url);

        await protractor.browser.driver.get(protractor.browser.baseUrl + slug.url);
        await protractor.browser.driver.wait(function () {
            return protractor.browser.driver.executeScript('return document.readyState').then(function (readyState) {
                return readyState === 'complete';
            });
        });
        await protractor.browser.driver.sleep(coolDown);
        await screenshotter.screenShotAndApi(screenshotName, folder + " " + screenshotName, folder, browser);
        return "url step complete";
    },

    async scrollElementID(browser, slug, screenshotName, folder) {

        screenCount = await screenshotter.countScreenshots(screenshotName, browser, screenCount)
        await protractor.browser.driver.executeScript('document.getElementById("' + slug.el + '").scrollTop= ' + slug.scroll + '')
        await protractor.browser.driver.sleep(coolDown);
        await screenshotter.screenShotAndApi(screenshotName, folder + " " + screenshotName, folder, browser);
        return "scroll step complete";
    },

    async scrollElementClass(browser, slug, screenshotName, folder) {

        screenCount = await screenshotter.countScreenshots(screenshotName, browser, screenCount)
        await protractor.browser.driver.executeScript('document.getElementsByClassName("' + slug.el + '")[0].scrollTop= ' + slug.scroll + '')
        await protractor.browser.driver.sleep(coolDown);
        await screenshotter.screenShotAndApi(screenshotName, folder + " " + screenshotName, folder, browser);
        return "scroll step complete";
    },

    async interactElementCSS(browser, slug, screenshotName, folder) {

        screenCount = await screenshotter.countScreenshots(screenshotName, browser, screenCount)
        await element(by.css(slug.el)).click()
        await protractor.browser.driver.sleep(coolDown);
        await screenshotter.screenShotAndApi(screenshotName, folder + " " + screenshotName, folder, browser)
        return "interact element css step complete";

    },

    async interactElementID(browser, slug, screenshotName, folder) {

        screenCount = await screenshotter.countScreenshots(screenshotName, browser, screenCount)
        await element(by.id(slug.el)).click()
        await protractor.browser.driver.sleep(coolDown);
        await screenshotter.screenShotAndApi(screenshotName, folder + " " + screenshotName, folder, browser)
        return "interact element id step complete";

    },

    async interactElementMulti(browser, slug, screenshotName, folder) {

        screenCount = await screenshotter.countScreenshots(screenshotName, browser, screenCount)
        for (let e = 0; e < slug.els.length; e++) {
            if (slug.els[e].first !== undefined) {
                await element(by.id(slug.els[e].first)).click();
            } else {
                await element(by.css(slug.els[e].firstCSS)).click();
            }

            if (slug.els[e].coolDown !== undefined) {
                await protractor.browser.driver.sleep(slug.els[e].coolDown);
            } else {
                await protractor.browser.driver.sleep(coolDown);
            }

            if (slug.els[e].first !== undefined) {
                await screenshotter.screenShotAndApi(screenshotName, folder + " " + screenshotName + " " + slug.els[e].first, folder, browser)
            } else {
                await screenshotter.screenShotAndApi(screenshotName, folder + " " + screenshotName + "-" + e, folder, browser)
            }

            if (slug.els[e].after !== undefined) {
                await element(by.id(slug.els[e].after)).click();
            } else {
                await element(by.css(slug.els[e].afterCSS)).click();
            }
        }
        return "interact multi step complete";

    },

    async sleep(browser, slug, screenshotName, folder) {

        screenCount = await screenshotter.countScreenshots(screenshotName, browser, screenCount)
        await protractor.browser.driver.sleep(slug.duration);
        await screenshotter.screenShotAndApi(screenshotName, folder + " " + screenshotName, folder, browser)
        return "sleep step complete";

    },

    async enterIframe(browser, slug, screenshotName, folder) {
        if (slug.id) {
            await protractor.browser.switchTo().frame(element(by.id(slug.id)).getWebElement());

            return "entered iframe " + slug.id;
        } else {
            await protractor.browser.switchTo().frame(element(by.tagName('iframe')).getWebElement());

            return "entered iframe";
        }
    },
}

const screenCounter = async function (screenShotName, browser, screenCount) {
    await screenshotter.countScreenshots(screenShotName, browser, screenCount)
}

const screenShotAndApi = async function (screenshotName, file, folder, browser) {
    await screenshotter.screenShotAndApi(screenshotName, file, folder, browser)
}


module.exports = {
    runTest,
    screenCounter,
    screenShotAndApi
}
