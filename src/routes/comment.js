// 댓글과 관련된 API

const router = require("express").Router() // express 안에 있는 Router만 import
const client = require("../../database/db");
const utils = require('../utils');


// 댓글 보기
router.get('/:postIdx', async(req, res) => {
    const postIdx = req.params.postIdx; // 사용자가 입력한 PostIdx
    const sessionUserIdx = req.session.userIdx; // 세션에 저장된 사용자 idx
    console.log("댓글 보기 세션: ", sessionUserIdx)

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

        // DB통신: 해당 게시글의 댓글 조회
        const sql = `SELECT * FROM scheduler.comment WHERE post_idx = $1`;
        const data = await pool.query(sql, [postIdx]);

         // DB 후처리
         const row = data.rows

        if (row.length === 0) {
            throw new Error("댓글이 존재하지 않습니다.");
        }

        // 결과 설정
        result.success = true;
        result.message = "댓글 조회 성공";
        result.data = data.rows;

    } catch (e) {
    result.message = e.message;
    } finally {
    res.send(result);
    }

});

// export 작업
module.exports = router// 댓글과 관련된 API