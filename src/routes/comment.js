// 댓글과 관련된 API

const router = require("express").Router() // express 안에 있는 Router만 import
const client = require("../../database/db");
const utils = require('../utils');
const exceptions = require('../exceptions');

// export 작업
module.exports = router