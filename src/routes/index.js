// 로그인 API

const router = require("express").Router() // express 안에 있는 Router만 import
const client = require('../../database/db') // postgreSQL연결
const utils = require('../utils');

// 로그인 라우트
router.post("/", async (req, res) => {
    const { id, password } = req.body;
    const result = {
        "success" : false,
        "message" : "",
        "data" : null
    }

    try {
        // 예외처리
        utils.checkRequiredField(id,"아이디")
        utils.checkRequiredField(password,"비밀번호")

        // DB통신
        const sql = `SELECT * FROM scheduler.user WHERE id = $1 AND password = $2`;
        const data = await client.query(sql, [id, password]);

        // DB 후처리
        const row = data.rows

        if(row.length === 0){
            throw new Error("회원정보가 존재하지 않습니다.")
        }
        
        result.success = true
        result.message = "로그인 성공!";
        result.data = row
        
    } catch (e) {
        result.message = e.message;
    } finally {
        res.send(result);
    }
});

module.exports = router;