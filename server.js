// express.js import하기
const express = require("express")
const session = require('express-session');
// postgreSQL연결
const utils = require('./src/utils');
const exception = require('./src/exception');

const app = express()
const port = 8000

app.use(express.json());    // application/json

// 세션 설정
app.use(session({
    secret: 'secret-key',       
    resave: false,              
    saveUninitialized: true,    
    cookie: { maxAge: 1800000 } 
}))

// API ( 파일을 반환하는 API )
app.get("/mainpage",(req,res) => {
    res.sendFile(`${__dirname}/main.html`)
})

const loginRouter = require('./src/routes/index');  // index.js파일 import
app.use('/login', loginRouter);

const accountApi = require("./src/routes/account") // account.js파일 import
app.use("/account", accountApi)

const postApi = require("./src/routes/post") // post.js파일 import
app.use("/post", postApi)

const commentApi = require("./src/routes/comment") // comment.js파일 import
app.use("/comment", commentApi)

// Web Server 실행 코드
app.listen(port, () => {
    console.log(`${port}번에서 HTTP Web Server 실행`)
})