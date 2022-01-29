const PNG = require('pngjs').PNG;
const pixelmatch = require('pixelmatch');
const mergeImg = require('merge-img');
var fs = require('fs');
const screenPackage = require("../../../visualRegression/screenshotPackage/screenshotPackage");
const protractor = require('protractor');

let screenShotAndApi = async function (screenshotName, file, folder, browser) {
  if (screenshotName !== undefined) {
    if (browser.params.screenshots !== "none") {
      let browserType = ""
      let browserName = ""
      
      if (browser.params.localscreenshots === 'enabled') {
        
        await browser.getCapabilities().then(function (caps) {
          browserName = caps.get("browserName")
        });

        let browserHeight = browser.params.height;
        let browserWidth = browser.params.width;
        browserType = browserName + " " + browserWidth + "x" + browserHeight;

        await browser.takeScreenshot().then(async (png) => {
          await writeScreenShot(png, file, file + ' ' + browserType + '.png', folder, browser, browserType);

          //check screenshot packager to see if screen should be packaged
          if (screenPackage.screenPackage.type === "curated") {
            for (let i = 0; i < screenPackage.screenPackage.list.length; i++) {
              if (screenPackage.screenPackage.list[i].screen === file) {
                await writeScreenShotPackage(png, (i + 1) + " " + screenPackage.screenPackage.list[i].packageScreen + ".png")
              }
            }
          } else if (screenPackage.screenPackage.type === "all") {

            let fileNum = 0;

            fs.readdirSync('../../visualRegression/screenshots/package/screens/').forEach(file => {
              fileNum++;
            });

            await writeScreenShotPackage(png, (fileNum + 1) + ".png")
          }

        });
      }
      if (browser.params.api !== "none") {
        await apiCall(file, browser, browserType)
      }
    }
  }
}

let checkDirectory = async function (directory, callback) {
  fs.stat(directory, function (err, stats) {
    //Check if error defined and the error code is "not exists"
    if (err && (err.code === 'ENOENT')) {
      console.log(err)
      //Create the directory, call the callback.
      fs.mkdir(directory, callback);
    } else {
      //just in case there was a different error:
      callback(err)
    }
  });
}


let countScreenshots = async function (screenShotName, browser, screenCount) {
  if (screenShotName !== undefined) {
    if (browser.params.screenshots !== "none") {
      return screenCount += 1;
    } else {
      return screenCount;
    }
  } else {
    return screenCount;
  }
}

let apiCall = async function (screenName, browser, browserType) {
  //api calls can be made here
}

let writeScreenShot = async function (data, file, filename, folder, browser, browserType) {
  checkDirectory('../../visualRegression/screenshots/current/', function (error) {
    if (error) {
      console.log(error);
    } else {
      checkDirectory('../../visualRegression/screenshots/current/' + browserType + "/", function (error) {
        if (error) {
          console.log(error);
        } else {
          checkDirectory('../../visualRegression/screenshots/current/' + browserType + "/" + folder + " " + browserType + '/', function (error) {
            if (error) {
              console.log(error);
            } else {
              return new Promise(resolve => {
                var stream = fs.createWriteStream('../../visualRegression/screenshots/current/' + browserType + "/" + folder + " " + browserType + '/' + filename);
                stream.write(new Buffer.from(data, 'base64'));
                stream.end()
                stream.on('finish', () => {
                  resolve(true)
                  if (browser.params.comparescreenshots === 'enabled') {
                    compareShots(file, file + ' ' + browserType + '.png', folder, browser, browserType)
                  }
                })
              })
            }
          })
        }
      })
    }
  })
}

let writeScreenShotPackage = async function (data, filename) {
  checkDirectory('../../visualRegression/screenshots/package/', function (error) {
    if (error) {
      console.log(error);
    } else {
      return new Promise(resolve => {
        var stream = fs.createWriteStream('../../visualRegression/screenshots/package/screens/' + filename);
        stream.write(new Buffer.from(data, 'base64'));
        stream.end()
        stream.on('finish', () => {
          resolve(true)
        })
      })
    }
  })
}

let compareShots = function (file, filename, folder, browser, browserType) {
  baselineDirectoryCheck('../../visualRegression/screenshots/baseline/' + browserType + "/" + folder + " " + browserType + '/', function (error) {
    if (error) {
      console.log('cannot find baseline directory for comparison')
      //add "new screenshot" functionality here
      writeNew(file, filename, folder, browser, browserType)
    } else {
      writeDiff(file, filename, folder, browser, browserType)
    }
  })
}

let baselineDirectoryCheck = async function (directory, callback) {
  fs.stat(directory, function (err, stats) {
    //Check if error defined and the error code is "not exists"
    if (err && (err.code === 'ENOENT')) {
      callback(err)
    } else {
      //just in case there was a different error:
      callback(err)
    }
  });
}

let writeDiff = async function (file, filename, folder, browser, browserType) {
  fs.readFile('../../visualRegression/screenshots/baseline/' + browserType + "/" + folder + " " + browserType + '/' + filename, function read(err, data) {
    if (err) {
      console.log('no baseline image found')
      //add "new screenshot" functionality here
      writeNew(file, filename, folder, browser, browserType)
    } else {
      const img1 = PNG.sync.read(fs.readFileSync('../../visualRegression/screenshots/baseline/' + browserType + "/" + folder + " " + browserType + '/' + filename));
      const img2 = PNG.sync.read(fs.readFileSync('../../visualRegression/screenshots/current/' + browserType + "/" + folder + " " + browserType + '/' + filename));

      const { width, height } = img1;
      const diff = new PNG({ width, height });

      let thresholdUser = Number(browser.params.threshold);
      let match = pixelmatch(img1.data, img2.data, diff.data, width, height, { threshold: thresholdUser });


      if (match > 0) {

        console.log('diff found in ' + filename + ' ' + browserType + '.png')

        checkDirectory('../../visualRegression/screenshots/diffs/', function (error) {
          if (error) {
            console.log(error);
          } else {
            checkDirectory('../../visualRegression/screenshots/diffs/' + browserType + "/", function (error) {
              if (error) {
                console.log(error);
              } else {
                checkDirectory('../../visualRegression/screenshots/diffs/' + browserType + "/" + folder + " " + browserType + '/', function (error) {
                  if (error) {
                    console.log(error);
                  } else {
                    fs.writeFileSync('../../visualRegression/screenshots/diffs/' + browserType + "/" + folder + " " + browserType + '/' + file + ' ' + browserType + '.png', PNG.sync.write(diff));

                    mergeImg(['../../visualRegression/screenshots/baseline/' + browserType + "/" + folder + " " + browserType + '/' + filename, '../../visualRegression/screenshots/current/' + browserType + "/" + folder + " " + browserType + '/' + filename, '../../visualRegression/screenshots/diffs/' + browserType + "/" + folder + " " + browserType + '/' + file + ' ' + browserType + '.png']).then((img) => {
                      // Save image as file
                      img.write('../../visualRegression/screenshots/diffs/' + browserType + "/" + folder + " " + browserType + '/' + file + ' ' + browserType + ' diffs.png', () =>
                        fs.unlink('../../visualRegression/screenshots/diffs/' + browserType + "/" + folder + " " + browserType + '/' + file + ' ' + browserType + '.png', (err) => {
                          if (err) {
                            console.error(err)
                            return

                          } else {

                            checkDirectory('../../visualRegression/screenshots/package/', function (error) {
                              if (error) {
                                console.log(error);
                              } else {
                                let fileNum = 0;

                                fs.readdirSync('../../visualRegression/screenshots/package/diffs/').forEach(file => {
                                  fileNum++;
                                });

                                fs.copyFile('../../visualRegression/screenshots/current/' + browserType + "/" + folder + " " + browserType + '/' + filename, '../../visualRegression/screenshots/package/diffs/' + (fileNum + 1) + ".png", (err) => {
                                  if (err) throw err;
                                  console.log('copying current image to diffs');
                                });
                              }
                            })
                          }
                        })
                      )
                    })
                  }
                })
              }
            })
          }
        })
      }
    }
  })
}

let writeNew = function (file, filename, folder, browser, browserType) {
  console.log('writing new image')
  checkDirectory('../../visualRegression/screenshots/package/', function (error) {
    if (error) {
      console.log(error);
    } else {
          let fileNum = 0;

          fs.readdirSync('../../visualRegression/screenshots/package/new/').forEach(file => {
            fileNum++;
          });

          fs.copyFile('../../visualRegression/screenshots/current/' + browserType + "/" + folder + " " + browserType + '/' + filename, '../../visualRegression/screenshots/package/new/' + (fileNum + 1) + ".png", (err) => {
            if (err) throw err;
            console.log('copying current image to new');
          });
        }
      })
}

let clearDirectory = async function (browser, browserType, folder) {

  let fileList = []
  try {
    fs.readdirSync('../../visualRegression/screenshots/current/' + browserType + "/" + folder + " " + browserType + '/').forEach(file => {
      fileList.push(file)
    });
  } catch (err) {
    console.log('no current ' + folder + " " + browserType + ' directory found')
  }
  fileList.forEach(file => {
    fs.unlink('../../visualRegression/screenshots/current/' + browserType + "/" + folder + " " + browserType + '/' + file, (err) => {
      if (err) {
        console.error(err)
        return
      }
    })
  })

  let fileList2 = []
  try {
    fs.readdirSync('../../visualRegression/screenshots/diffs/' + browserType + "/" + folder + " " + browserType + '/').forEach(file => {
      fileList2.push(file)
    });
  } catch (err) {
    console.log('no diffs ' + folder + " " + browserType + ' directory found')
  }
  fileList2.forEach(file => {
    fs.unlink('../../visualRegression/screenshots/diffs/' + browserType + "/" + folder + " " + browserType + '/' + file, (err) => {
      if (err) {
        console.error(err)
        return
      }
    })
  })
}

module.exports = {
  screenShotAndApi,
  countScreenshots,
  clearDirectory
}
