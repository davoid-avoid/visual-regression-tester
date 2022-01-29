const fs = require('fs');
const PDFDocument = require('pdfkit');

let screenPackager = {
  packageRemove(type) {
    let fileList = []
    try {
      fs.readdirSync('../../visualRegression/screenshots/package/' + type + "/").forEach(file => {
        fileList.push(file)
      });
    } catch (err) {
      console.log('no ' + type + '/ directory found')
      fs.mkdir('../../visualRegression/screenshots/package/', function () {
        fs.mkdir('../../visualRegression/screenshots/package/' + type + "/", function () {
          console.log(type + '/ directory created')
        });
      });
    }
    fileList.forEach(file => {
      fs.unlink('../../visualRegression/screenshots/package/' + type + "/" + file, (err) => {
        if (err) {
          console.error(err)
          return
        }
      })
    })
  },

  packageScreenshots(type) {
    fs.stat('../../visualRegression/screenshots/package/' + type + "/", function (err, stats) {
      //Check if error defined and the error code is "not exists"
      if (err && (err.code === 'ENOENT')) {
        console.log(err)
      } else {
        let fileList = []
        fs.readdirSync('../../visualRegression/screenshots/package/' + type + "/").forEach(file => {
          fileList.push(file)
        });
        fileList.sort(naturalCompare)
        let finalList = []
        let nameList = []
        fileList.forEach(file => {
          finalList.push('../../visualRegression/screenshots/package/' + type + "/" + file);
          nameList.push(file);
        })
        if (finalList.length > 0) {
          /*let fileName = '../../visualRegression/screenshots/package/' + type + "/" + type + '.pdf';
          const doc = new PDFDocument();
          const writeStream = fs.createWriteStream(fileName)
          doc.pipe(writeStream);
          let iteration = 0;
          writePDFImage(iteration, fileName, finalList, nameList, doc, type)*/
        }
      }
    });
  },

  addCover(type) {
    let screenPackage = require("../../../visualRegression/screenshotPackage/screenshotPackage");
    if (screenPackage.screenPackage.cover === true) {
      fs.stat('../../visualRegression/screenshotPackage/coverImage/', function (err, stats) {
        //Check if error defined and the error code is "not exists"
        if (err && (err.code === 'ENOENT')) {
          console.log(err)
          //Create the directory, call the callback.
          fs.mkdir('../../visualRegression/screenshotPackage/coverImage/');
        }

        let fileList = []
        fs.readdirSync('../../visualRegression/screenshotPackage/coverImage/').forEach(file => {
          fileList.push(file)
        });
        if (fileList.length > 0) {
          fs.copyFile('../../visualRegression/screenshotPackage/coverImage/cover.png', '../../visualRegression/screenshots/package/screens/0.png', (err) => {
            if (err) throw err;
          });
        }
      });
    }
  }
}

function writePDFImage(i, fileName, finalList, nameList, doc, type) {
  if (i < finalList.length) {
    fs.readFile(finalList[i], function(err, data) {
      if (err) throw err;
      doc.addPage().image(data, { align: 'center', valign: 'center' });
      i++;
      writePDFImage(i, fileName, finalList, nameList, doc, type)
    });
  } else {
    savePdfToFile(doc, fileName)
  }
}

function savePdfToFile(pdf, fileName) {
  return new Promise((resolve, reject) => {

    // To determine when the PDF has finished being written successfully 
    // we need to confirm the following 2 conditions:
    //
    //   1. The write stream has been closed
    //   2. PDFDocument.end() was called syncronously without an error being thrown

    let pendingStepCount = 2;

    const stepFinished = () => {
      if (--pendingStepCount == 0) {
        resolve();
      }
    };

    const writeStream = fs.createWriteStream(fileName);
    writeStream.on('close', stepFinished);
    pdf.pipe(writeStream);

    pdf.end();

    stepFinished();
  });
}

function naturalCompare(a, b) {
  var ax = [], bx = [];

  a.replace(/(\d+)|(\D+)/g, function (_, $1, $2) { ax.push([$1 || Infinity, $2 || ""]) });
  b.replace(/(\d+)|(\D+)/g, function (_, $1, $2) { bx.push([$1 || Infinity, $2 || ""]) });

  while (ax.length && bx.length) {
    var an = ax.shift();
    var bn = bx.shift();
    var nn = (an[0] - bn[0]) || an[1].localeCompare(bn[1]);
    if (nn) return nn;
  }

  return ax.length - bx.length;
}

module.exports = {
  screenPackager
}
