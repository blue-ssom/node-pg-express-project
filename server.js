// express.js import하기
const express = require("express")
const session = require('express-session');
const client = require('./database/db') // postgreSQL연결
const utils = require('./src/utils');
const dotenv = require('dotenv').config(); // dotenv 패키지를 사용하여 환경 변수 로드

const app = express()
const port = 8000

app.use(express.json()); // application/json

// 세션 설정
app.use(session({
    secret: 'secret-key',       
    resave: false,              
    saveUninitialized: true,    
    cookie: { maxAge: 1800000 } 
}))


const loginRouter = require('./src/routes/index');  // index.js파일 import
app.use('/login', loginRouter);

// const accountApi = require("./src/routes/account") // account.js파일 import
// app.use("/account", accountApi)

// const postApi = require("./src/routes/post") // post.js파일 import
// app.use("/post", postApi)

// const commentApi = require("./src/routes/comment") // comment.js파일 import
// app.use("/comment", commentApi)

// Web Server 실행 코드
app.listen(port, () => {
    console.log(`${port}번에서 HTTP Web Server 실행`)
})