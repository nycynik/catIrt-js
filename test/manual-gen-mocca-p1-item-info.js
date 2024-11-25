#!/usr/bin/env node
const catirt_load = require('../dist/catirt');
const items = require('../data/mocca-items.json');
const DataLogger = require('./utils/data-logger');

// extract params
const params = items.map(i => i.p1params);

// create theta range
const theta = [];
for (let t100 = -500; t100 <= 500; t100 += 5) {
  theta.push(t100 / 100);
}

catirt_load().then(function(catirt) {
  const mParams = catirt.MatrixFromArray(params);
  const mResp = new catirt.Matrix(0, 0);
  const mTheta = catirt.MatrixFromArray([theta]);
  const info = catirt.wasm_FI_brm(mParams, mTheta, catirt.FIType.EXPECTED, mResp);

  // header and logging starts
  logger = new DataLogger([
    'theta','item','info','a','b','c'
  ], 'p1_item_results.csv');
  
  for (let m = 0; m < info.item.rows(); m++) {
    for (let n = 0; n < info.item.cols(); n++) {
      logger.logRow({
        theta: theta[m],
        item: items[n]['id'],
        info: info.item.get(m, n),
        a: params[n][0],
        b: params[n][1],
        c: params[n][2]
      });
    }
  }

  // cleanup
  mParams.delete();
  mResp.delete();
  mTheta.delete();
  info.item.delete();
  info.test.delete();
  info.sem.delete();

  logger.finish()

});

