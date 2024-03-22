// 계정과 관련된 API

const router = require("express").Router() // express 안에 있는 Router만 import
const pool = require("../../database/db");
const utils = require('../utils');

// 아이디 찾기
router.get('/find-id', async(req, res) => {
    const { name, phoneNumber} = req.body
    const result = {
        "success" : false,
        "message" : "",
        "data" : null
    }

    try {

        // 예외처리
        utils.checkName(name)
        utils.checkPhoneNumber(phoneNumber)

        // DB통신
        const sql = `SELECT id FROM scheduler.user WHERE name = $1 AND phonenumber = $2`;
        const data = await pool.query(sql, [name, phoneNumber]);

        // DB 후처리
        const row = data.rows

        if(row.length === 0){
            throw new Error("회원정보가 존재하지 않습니다.")
        }
        
        result.success = true
        result.message = "아이디 찾기 성공";
        result.data = row[0].id;

   } catch (e) {
       result.message = e.message;
   } finally {
       res.send(result);
   }
});

// 비밀번호 찾기
router.get('/find-password', async(req, res) => {
    const { id, name, phoneNumber} = req.body
    const result = {
        "success" : false,
        "message" : "",
        "data" : null
    }

    try {

        // 예외처리
        utils.checkRequiredField(id, "아이디")
        utils.checkName(name, "이름")
        utils.checkPhoneNumber(phoneNumber, "전화번호")

        // DB통신
        const sql = `SELECT password FROM scheduler.user WHERE id = $1 AND name = $2 AND phoneNumber = $3`;
        const data = await pool.query(sql, [id, name, phoneNumber]);

        // DB 후처리
        const row = data.rows

        if(row.length === 0){
            throw new Error("회원정보가 존재하지 않습니다.")
        }
        
        result.success = true
        result.message = "비밀번호 찾기 성공";
        result.data = row[0].password;

   } catch (e) {
       result.message = e.message;
   } finally {
       res.send(result);
   }
});

// 특정 user 정보 보기
router.get('/:idx', async(req, res) => {
    const requestedUserIdx = parseInt(req.params.idx) // 사용자가 입력한 idx
    const sessionUserIdx = req.session.userIdx; // 세션에 저장된 사용자 idx
    console.log("특정 user 정보 보기에서 세션: ", sessionUserIdx)
    
    const result = {
            "success" : false,
            "message" : "",
            "data" : null
        }
   
   try {
        // 예외처리
        if (requestedUserIdx !== sessionUserIdx) {
          throw new Error("잘못된 접근입니다.")   // 세션이 없는 경우
        }

        // DB통신
        const sql = `SELECT * FROM scheduler.user WHERE idx = $1`;
        const data = await pool.query(sql, [sessionUserIdx]);

        // DB 후처리
        const row = data.rows

        if (row.length === 0) {
            throw new Error("회원정보가 존재하지 않습니다.");
        }
        
        // 결과 설정
        result.success = true;
        result.message = "특정 user 정보 조회 성공";
        result.data = row[0];

    } catch (e) {
    result.message = e.message;
    } finally {
    res.send(result);
    }

});

// 회원가입
router.post('/', async(req, res) => {
    const { id, password, name, phoneNumber, email, address } = req.body
    console.log(req.body);

    const result = {
        "success" : false,
        "message" : "",
        "data" : null
    }

    try {

        // 예외처리
        exceptions.checkRequiredField(id, "아이디")
        exceptions.checkRequiredField(password, "비밀번호")
        exceptions.checkRequiredField(name, "이름")
        exceptions.checkRequiredField(phoneNumber, "전화번호")
        exceptions.checkRequiredField(email, "이메일")
        exceptions.checkRequiredField(address, "주소")

        // DB통신
        // 1. 아이디 중복 확인
        await utils.checkDuplicateId(id);
        
        // 2. 이메일 중복 확인
        await utils.checkDuplicateEmail(email);
      
        // 3. 전화번호 중복 확인
        await utils.checkDuplicatePhoneNumber(phoneNumber); 

        // DB통신
        const sql = `
            INSERT INTO scheduler.user (id, password, name, phonenumber, email, address) 
            VALUES ($1, $2, $3, $4, $5, $6)
        `;

        const data = await pool.query(query, [id, password, name, phoneNumber, email, address]);

        // DB 후처리
        const row = data.rows

        // 결과 설정
        result.success = true;
        result.message = "회원가입 성공";
        result.data = row[0];

    } catch(e) {
        result.message = e.message;
    } finally {
        res.send(result);
    }

});

// 내 회원 정보 수정
router.put('/', async(req, res) => {
    const {password, name, phoneNumber, email, address } = req.body
    console.log(req.body);

    const sessionUserIdx = req.session.userIdx; // 세션에 저장된 사용자 idx
    console.log("회원 정보 수정 세션: ", sessionUserIdx);

    const result = {
            "success" : false,
            "message" : "",
            "data" : null
        }
   
    try {

        // 예외처리
        // if (!sessionUserIdx) {
        //   throw new Error("잘못된 접근입니다.")   // 세션이 없는 경우
        // }

        exceptions.checkRequiredField(password, "비밀번호")
        exceptions.checkRequiredField(name, "이름")
        exceptions.checkRequiredField(phoneNumber, "전화번호")
        exceptions.checkRequiredField(email, "이메일")
        exceptions.checkRequiredField(address, "주소")

        // DB통신
        // 1. 아이디 중복 확인
        await utils.checkDuplicateId(id);
    
        // 2. 이메일 중복 확인
        await utils.checkDuplicateEmail(email);
    
        // 3. 전화번호 중복 확인
        await utils.checkDuplicatePhoneNumber(phoneNumber);

        // 내 정보 수정 진행
        const sql = `
            UPDATE scheduler.user 
            SET password = $1, name = $2, phonenumber = $3, email = $4, address = $5 
            WHERE idx = $6
        `;
    
        const data = await pool.query(sql, [password, name, phoneNumber, email, address, sessionUserIdx]);

        // DB 후처리
        const row = data.rows

        // 결과 설정
        result.success = true;
        result.message = "내 정보 수정 성공";
        result.data = row[0];
        
    } catch(e) {
        result.message = e.message;
    } finally {
        res.send(result);
    }

});

// 내 회원 탈퇴(아 DB에 cascade 설정 안해줬다)
router.delete('/', async(req, res) => {
    const sessionUserIdx = req.session.userIdx; // 세션에 저장된 사용자 idx
    console.log("회원 탈퇴 세션: ", sessionUserIdx);

    const result = {
            "success" : false,
            "message" : "",
            "data" : null
        }
   
    try {

        // 예외처리
        // if (!sessionUserIdx) {
        //   throw new Error("잘못된 접근입니다.")   // 세션이 없는 경우
        // }

        // DB통신
        const sql = `
            DELETE FROM scheduler.user 
            WHERE idx = $1
        `;

        const data = await pool.query(sql, [sessionUserIdx]);

        // DB 후처리
        const row = data.rows

        // 결과 설정
        result.success = true;
        result.message = "회원탈퇴 성공";
        
    } catch(e) {
        result.message = e.message;
    } finally {
        res.send(result);
    }
});

// export 작업
module.exports = router