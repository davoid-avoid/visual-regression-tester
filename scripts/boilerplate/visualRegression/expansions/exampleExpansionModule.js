let coolDown;
let screenCount;

const expansionModule = async function (step, test, browser, coolDownMod, screenCountMod) {
    coolDown = coolDownMod;
    screenCount = screenCountMod;

    if (localMethods[step.type] !== undefined) {
        await localMethods[step.type](browser, step, test).then(callback => {
            console.log(callback)
        })
    } else {
        console.log(step.type + ' method not found in example module')
    }

    return screenCount;
}

const localMethods = {
    async exampleExpansionScroll(browser, step, test) {

        let visualRegression = require("visual-regression-tester");

        await browser.driver.sleep(coolDown);
        let browserHeight = 0;
        await browser.driver.manage().window().getSize().then(function (size) {
            browserHeight = parseInt(size.height);
        })

        let elHeight = 0;
        await element(by.css(step.measureTag + '[class*="' + step.measureClass + '"]')).getSize().then(function (size) {
            console.log("el height: " + size.height);
            console.log(browserHeight);
            elHeight = parseInt(size.height);
        });

        if (elHeight > (browserHeight - 100)) {
            let scrolls = Math.floor(((elHeight + (browserHeight)) - 1) / (browserHeight))
            for (let i = 1; i < scrolls; i++) {
                await browser.driver.executeScript('document.getElementsByClassName("' + step.scrollClass + '")[0].scrollTop = ' + (i * (browserHeight - 100)))
                await browser.driver.sleep(coolDown);
                await visualRegression.screenShotAndApi(step.screenshotName, test.testName + " " + step.screenshotName + "-" + i, test.testName, browser)
                await browser.driver.sleep(coolDown);
                await browser.driver.executeScript('document.getElementsByClassName("' + step.scrollClass + '")[0].scrollTop = 0')
            }
        }

        return "example expansion scroll complete"
    }
}

module.exports = {
    expansionModule
}