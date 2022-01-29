import ncp from 'ncp';
import * as fs from 'fs';

fs.stat('../../visualRegression/', function (err, stats) {
  //Check if error defined and the error code is "not exists"
  if (err) {
    //Create the directory, call the callback.
    ncp.limit = 16;

    ncp('scripts/boilerplate', '../../', { clobber: false }, function (err) {
      if (err) {
        return console.error(err);
      }
      console.log('boilerplate example directory created');
      fs.rename('../../visualRegression/screenshots/.npmignore', '../../visualRegression/screenshots/.gitignore', () => {
        console.log('installation complete')
      })
    });
  } else {
    console.log('visual regression directory already found in project. Halting install.')
  }
})

