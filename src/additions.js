Module['MatrixFromArray'] = function(arr) {
  if (arr.length === 0) {
    return new Module.Matrix(0, 0);
  }

  let v2d = new Module.Vector2d();
  arr.forEach(a => {
    let v = new Module.Vector();
    a.forEach(val => v.push_back(val));
    v2d.push_back(v);
    v.delete();
  });
  const m = Module.Matrix.fromVector(v2d);
  v2d.delete();
  return m;
};

Module['MatrixToArray'] = function(m) {
  const res = [];
  for (let i = 0; i < m.rows(); i++) {
    res.push([]);
    for (let j = 0; j < m.cols(); j++) {
      res[i].push(m.get(i, j));
    }
  }
  return res;
};

Module['VectorToArray'] = function(v) {
  const res = [];
  for (let i = 0; i < v.size(); i++) {
    res.push(v.get(i));
  }
  return res;
};

Module['wleEst_brm_one'] = function(resp, params, range=[-4.5, 4.5]) {
  if (!(Array.isArray(resp) && resp.length)) {
    return {
      error: 'response must be a non-empty array'
    };
  }
  if (!(Array.isArray(params) && params.length)) {
    return {
      error: 'params must be a non-empty array'
    };
  }
  if (!(resp.length === params.length)) {
    return {
      error: 'length of response must match length of params'
    };
  }
  for (let i = 0; i < resp.length; i++) {
    if (!((typeof resp[i] === 'number') && Number.isFinite(resp[i]))) {
      return {
        error: 'response has non-numeric or non-finite elements'
      };
    }
  }

  const result = {};
  const mResp = Module.MatrixFromArray([resp]);
  const mParams = Module.MatrixFromArray(params);
  const mRange = Module.MatrixFromArray([range]);
  const est = Module.wleEst(mResp, mParams, mRange, Module.ModelType.BRM);

  result.theta = est.theta.get(0);
  result.info = est.info.get(0);
  result.sem = est.sem.get(0);

  // cleanup wasm heap
  mResp.delete();
  mParams.delete();
  mRange.delete();
  est.theta.delete();
  est.info.delete();
  est.sem.delete();

  return result;
};

Module['wleEst_grm_one'] = function(resp, params, range=[-4.5, 4.5]) {
  if (!(Array.isArray(resp) && resp.length)) {
    return {
      error: 'response must be a non-empty array'
    };
  }
  if (!(Array.isArray(params) && params.length)) {
    return {
      error: 'params must be a non-empty array'
    };
  }
  if (!(resp.length === params.length)) {
    return {
      error: 'length of response must match length of params'
    };
  }
  for (let i = 0; i < resp.length; i++) {
    if (!((typeof resp[i] === 'number') && Number.isFinite(resp[i]))) {
      return {
        error: 'response has non-numeric or non-finite elements'
      };
    }
  }

  const result = {};
  const mResp = Module.MatrixFromArray([resp]);
  const mParams = Module.MatrixFromArray(params);
  const mRange = Module.MatrixFromArray([range]);
  const est = Module.wleEst(mResp, mParams, mRange, Module.ModelType.GRM);

  result.theta = est.theta.get(0);
  result.info = est.info.get(0);
  result.sem = est.sem.get(0);

  // cleanup wasm heap
  mResp.delete();
  mParams.delete();
  mRange.delete();
  est.theta.delete();
  est.info.delete();
  est.sem.delete();

  return result;
};

Module['FI_brm_expected_one'] = function(params, theta) {
  if (!(Array.isArray(params) && params.length)) {
    return {
      error: 'params must be a non-empty array'
    };
  }
  if (!Number.isFinite(theta)) {
    return {
      error: 'theta must be a finite number'
    };
  }

  const result = {
    item: []
  };

  const mParams = Module.MatrixFromArray(params);
  const mTheta = Module.MatrixFromArray([[theta]]);
  const mResp = new Module.Matrix(0, 0);
  const res = Module.FI_brm(mParams, mTheta, Module.FIType.EXPECTED, mResp);

  for (let i = 0; i < res.item.cols(); i++) {
    result.item.push(res.item.get(0, i));
  }
  result.test = res.test.get(0);
  result.sem = res.sem.get(0);

  // wasm heap cleanup
  mParams.delete();
  mTheta.delete();
  mResp.delete();
  res.item.delete();
  res.test.delete();
  res.sem.delete();

  return result;
};

Module['FI_grm_expected_one'] = function(params, theta) {
  if (!(Array.isArray(params) && params.length)) {
    return {
      error: 'params must be a non-empty array'
    };
  }
  if (!Number.isFinite(theta)) {
    return {
      error: 'theta must be a finite number'
    };
  }

  const result = {
    item: []
  };

  const mParams = Module.MatrixFromArray(params);
  const mTheta = Module.MatrixFromArray([[theta]]);
  const mResp = new Module.Matrix(0, 0);
  const res = Module.FI_grm(mParams, mTheta, Module.FIType.EXPECTED, mResp);

  for (let i = 0; i < res.item.cols(); i++) {
    result.item.push(res.item.get(0, i));
  }
  result.test = res.test.get(0);
  result.sem = res.sem.get(0);

  // wasm heap cleanup
  mParams.delete();
  mTheta.delete();
  mResp.delete();
  res.item.delete();
  res.test.delete();
  res.sem.delete();

  return result;
};

Module['termGLR_one'] = function(params, resp, options={}) {
  const defaults = {
    range: [-4.5, 4.5],
    bounds: [-1, 1],
    categories: [0, 1, 2],
    delta: 0.1,
    alpha: 0.05,
    beta: 0.05
  };
  options = Object.assign({}, defaults, options);

  //
  // Argument checks
  //

  // validate params
  if (!(Array.isArray(params) && params.length && Array.isArray(params[0]) && params[0].length > 1)) {
    return {
      error: 'params must be a non-empty 2-D array'
    };
  }
  // validate resp
  if (!(Array.isArray(resp) && resp.length === params.length)) {
    return {
      error: 'length of resp must match length of params'
    };
  }
  for (let i = 0; i < resp.length; i++) {
    if (!((typeof resp[i] === 'number') && Number.isFinite(resp[i]))) {
      return {
        error: 'resp values must all be finite'
      };
    }
  }
  // validate options
  if (!(Array.isArray(options.range) && (options.range.length === 2) && (options.range[0] < options.range[1]))) {
    return {
      error: 'invalid range option'
    };
  }
  if (!(Array.isArray(options.bounds) && options.bounds.length === params[0].length - 1)) {
    return {
      error: 'invalid bounds option'
    };
  }
  if (!(Array.isArray(options.categories) && options.categories.length === params[0].length)) {
    return {
      error: 'invalid categories option'
    };
  }
  if (!(Number.isFinite(options.delta) && options.delta > 0)) {
    return {
      error: 'invalid delta option'
    };
  }
  if (!(Number.isFinite(options.alpha) && options.alpha > 0)) {
    return {
      error: 'invalid alpha option'
    };
  }
  if (!(Number.isFinite(options.beta) && options.beta > 0)) {
    return {
      error: 'invalid beta option'
    };
  }

  const c_lower = Math.log( options.beta / (1 - options.alpha) );
  const c_upper = Math.log( (1 - options.beta) / options.alpha );

  // get likVals for points surrounding the cutpoint
  const theta = [];
  for (let t = options.range[0]; t <= options.range[1]; t += 0.01) {
    theta.push(t);
  }

  const mResp = Module.MatrixFromArray([resp]);
  const mParams = Module.MatrixFromArray(params);
  const mTheta = Module.MatrixFromArray([theta]);
  const res = Module.logLik_grm(mResp, mTheta, mParams, Module.LogLikType.MLE);

  const likVals = Module.VectorToArray(res);

  mResp.delete();
  mParams.delete();
  mTheta.delete();
  res.delete();

  // find the highest point on the likelihood ratiofunction
  const likRat = [];
  for (let k = 0; k < options.bounds.length; k++) {
    // Find the likelihood based on the indifference region
    const u = Math.max(...likVals.filter((v, i) => (theta[i] > options.bounds[k] + options.delta)));
    const l = Math.max(...likVals.filter((v, i) => (theta[i] < options.bounds[k] - options.delta)));

    // standard likelihood ratio
    likRat[k] = u - l;
  }
  likRat.unshift(c_upper + 0.000001);
  likRat.push(c_lower - 0.000001);

  // test each category
  for (let k = 0; k < options.bounds.length + 1; k++) {
    if ((likRat[k] >= c_upper) && (likRat[k+1] <= c_lower)) {
      return options.categories[k];
    }
  }

  return null;
};

// add deep copy to objects and arrays
if (typeof Object.prototype.deepcopy === 'undefined') {
  Object.defineProperty(Object.prototype, 'deepcopy', {
    value: function() {
      function deepcopy(obj) {
        if (typeof obj !== 'object' || obj === null) {
          return obj;
        }
        const copy = Array.isArray(obj) ? [] : {};
        for (key in obj) {
          copy[key] = deepcopy(obj[key]);
        }
        return copy;
      }
      return deepcopy(this);
    }
  });
}

// add Fisher-Yates shuffle to arrays
if (typeof Array.prototype.shuffle === 'undefined') {
  Object.defineProperty(Array.prototype, 'shuffle', {
    value: function() {
      for (let i = this.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this[i], this[j]] = [this[j], this[i]];
      }
      return this;
    }
  });
}

Module['itChoose'] = function(from_items, model, select, at, options={}) {
  const defaults = {
    numb: 1,
    n_select: 1,
    cat_par: null,
    cat_resp: null,
    cat_theta: null,
    range: null,
    it_range: null,
    delta: null,
    bounds: null,
    ddist: null,
    quad: null
  };
  options = Object.assign({}, defaults, options);

  //
  // Argument checks
  //

  // validate model
  if (!(model === 'brm' || model === 'grm')) {
    return {
      error: `Invalid or unsupported "model" provided: "${model}"`
    };
  }

  // validate from_items
  if (!(Array.isArray(from_items) && from_items.length > 0)) {
    return {
      error: `"from_items" must be a non-empty array`
    };
  }
  if (!(typeof from_items[0] === 'object' && Array.isArray(from_items[0].params))) {
    return {
      error: `"from_items" entries must be objects with params array`
    };
  }
  if ((model === 'brm') && !(from_items[0].params.length === 3)) {
    return {
      error: `"from_items" params must have length 3 for brm model`
    };
  }
  if ((model === 'grm') && !(from_items[0].params.length > 1)) {
    return {
      error: `"from_items" params must have length greater than 1 for grm model`
    };
  }

  // validate select
  if (!(select === 'UW-FI')) {
    return {
      error: `Invalid or unsupported "select" provided: "${select}"`
    };
  }

  // validate at
  if (!(at === 'theta')) {
    return {
      error: `Invalid or unsupported "at" provided: "${at}"`
    };
  }

  // validate options
  if (!(Number.isFinite(options.numb) && options.numb > 0 && Math.floor(options.numb) === options.numb)) {
    return {
      error: `"numb" must be be an integer greater than 0`
    };
  }
  if (!(Number.isFinite(options.n_select) && options.n_select > 0 && Math.floor(options.n_select) === options.n_select)) {
    return {
      error: `"n_select" must be be an integer greater than 0`
    };
  }
  if (!(options.cat_par === null)) {
    return {
      error: `non-null "cat_par" not used`
    };
  }
  if (!(options.cat_resp === null)) {
    return {
      error: `non-null "cat_resp" not used`
    };
  }
  if (!(options.cat_theta === null || Number.isFinite(options.cat_theta))) {
    return {
      error: `"cat_theta" must be finite or null`
    };
  }
  if (!(options.range === null)) {
    return {
      error: `"range" not used`
    };
  }
  if (!(options.it_range === null)) {
    return {
      error: `"it_range" not supported`
    };
  }
  if (!(options.delta === null)) {
    return {
      error: `non-null "delta" not used`
    };
  }
  if (!(options.bounds === null)) {
    return {
      error: `non-null "bounds" not used`
    };
  }
  if (!(options.ddist === null)) {
    return {
      error: `non-null "ddist" not used`
    };
  }
  if (!(options.quad === null)) {
    return {
      error: `non-null "quad" not used`
    };
  }

  //
  // Calculate item info
  //

  const theta = (options.cat_theta || 0);
  let item_info = [];

  if (select === 'UW-FI') {
    if (model === 'brm') {
      item_info = Module.FI_brm_expected_one(from_items.map(item => item.params), theta)['item'];
    }
    else {
      item_info = Module.FI_grm_expected_one(from_items.map(item => item.params), theta)['item'];
    }
  }

  // create sortable info array that tracks from_items index
  const info_sort = [];
  item_info.forEach((info, i) => {
    info_sort.push({info, index: i});
  });


  //
  // Sort and choose items
  //

  // sort and select random sample from top N items
  info_sort.sort((a, b) => b.info - a.info);
  const top_items = info_sort.slice(0, options.n_select).map(o => {
    return {
      id: from_items[o.index].id,
      params: from_items[o.index].params,
      info: o.info
    };
  });
  const selected_items = top_items.shuffle().slice(0, options.numb);

  return {
    items: selected_items,
  }
};

Module['getAnswers'] = function(resp) {
  if (!Array.isArray(resp)) {
    return [];
  }
  return resp.filter(r => Number.isFinite(r));
}

Module['getAnsweredItems'] = function(items, resp) {
  if (!Array.isArray(resp) || !Array.isArray(items) || items.length !== resp.length) {
    return [];
  }
  return items.filter((val, i) => Number.isFinite(resp[i]));
}

Module['getUnansweredItems'] = function(items, resp) {
  if (!Array.isArray(resp) || !Array.isArray(items) || items.length !== resp.length) {
    return [];
  }
  return items.filter((val, i) => !Number.isFinite(resp[i]));
}