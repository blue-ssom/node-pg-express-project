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

// 댓글 추가
router.post('/:postIdx', async(req, res) => {
    const postIdx = req.params.postIdx; // 사용자가 입력한 PostIdx
    const sessionUserIdx = req.session.userIdx; // 세션에 저장된 사용자 idx
    console.log("댓글 추가하기 세션: ", sessionUserIdx)
    
    const { content } = req.body
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

        checkContent(content);

        // DB통신: 댓글 추가
        const insertCommentSQL = `
            INSERT INTO scheduler.comment (post_idx, user_idx, content, creationdate, updationdate)
            VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `;
        const insertCommentResult = await pool.query(insertCommentSQL, [postIdx, sessionUserIdx, content]);

        // 결과 설정
        result.success = true;
        result.message = "댓글 추가 성공";
        result.data = insertCommentResult.rows[0];
        
    } catch(e) {
        result.message = e.message;
    } finally {
        res.send(result);
    }

});

// 댓글 수정
router.put('/:postIdx/:commentIdx', async (req, res) => {
    const postIdx = req.params.postIdx; // 게시글 ID
    const commentIdx = req.params.commentIdx; // 댓글 ID
    const { content } = req.body; // 수정된 댓글 내용
    const sessionUserIdx = req.session.userIdx; // 세션에 저장된 사용자 idx
    console.log("댓글 수정하기 세션: ", sessionUserIdx)

    const result = {
        "success": false,
        "message": "",
        "data": null
    };

    try {
        // 예외처리
            // if (!sessionUserIdx) {
            //   throw new Error("잘못된 접근입니다.")   // 세션이 없는 경우
            // } 

            checkContent(content);
            
            // DB통신: 댓글 수정
            const updateCommentSQL = `
                UPDATE scheduler.comment
                SET content = $1,
                    updationdate = CURRENT_TIMESTAMP
                WHERE comment_idx = $2 AND post_idx = $3;
            `;
            const updateCommentResult = await pool.query(updateCommentSQL, [content, commentIdx, postIdx]);

            // DB 후처리
            const row = updateCommentResult.rows;

            if (row.length === 0) {
                throw new Error("댓글 수정에 실패하였습니다.");
            }

            // 결과 설정
            result.success = true;
            result.message = "댓글 수정 성공";
    } catch (e) {
        result.message = e.message;
    } finally {
        res.send(result);
    }
});

// 댓글 삭제하기
router.delete('/:postIdx/:commentIdx', async (req, res) => {
    const postIdx = req.params.postIdx; // 게시글 ID
    const commentIdx = req.params.commentIdx; // 댓글 ID
    const sessionUserIdx = req.session.userIdx; // 세션에 저장된 사용자 idx
    console.log("댓글 삭제하기 세션: ", sessionUserIdx)

    const result = {
        "success": false,
        "message": "",
        "data": null
    };

    try {
       
        // 세션에 사용자 ID가 없는 경우
        // if (!sessionUserIdx) {
        //     throw new Error("잘못된 접근입니다.");
        // }

        // 해당 게시물의 댓글 조회
        const commentQuery = `
            SELECT * 
            FROM scheduler.comment 
            WHERE post_idx = $1 AND comment_idx = $2
        `;
        const commentResult = await pool.query(commentQuery, [postIdx, commentIdx]);

        // 댓글이 없는 경우
        if (commentResult.rows.length === 0) {
            throw new Error("해당 댓글을 찾을 수 없습니다.");
        }

        // 댓글 삭제 쿼리 실행
        const deleteQuery = `
            DELETE FROM scheduler.comment 
            WHERE post_idx = $1 AND comment_idx = $2
        `;
        await pool.query(deleteQuery, [postIdx, commentIdx]);

        // 결과 설정
        result.success = true;
        result.message = "댓글 삭제 성공";
    } catch (error) {
        // 오류 발생 시
        res.status(500).json({
            success: false,
            message: error.message
        });
    }

});

// 댓글 좋아요 추가
router.post('/:commentIdx/like', async (req, res) => {
    const commentIdx = req.params.commentIdx; // 댓글 ID
    const sessionUserIdx = req.session.userIdx; // 세션에 저장된 사용자 ID
    console.log("댓글 좋아요 세션: ", sessionUserIdx)


    const result = {
        "success": false,
        "message": "",
        "data": null
    };

    try {

        // 세션에 사용자 ID가 없는 경우
        // if (!sessionUserIdx) {
        //     throw new Error("잘못된 접근입니다.");
        // }
        
        // 좋아요 여부 확인
        const likeCheckSQL = `
            SELECT * FROM scheduler.comment_likes
            WHERE comment_idx = $1 AND user_idx = $2;
        `;
        const likeCheckResult = await pool.query(likeCheckSQL, [commentIdx, sessionUserIdx]);

        if (likeCheckResult.rows.length > 0) {
            throw new Error("이미 댓글에 좋아요를 누르셨습니다.");
        }

        // DB통신: 댓글 좋아요 추가
        const likeInsertSQL = `
            INSERT INTO scheduler.comment_likes (comment_idx, user_idx)
            VALUES ($1, $2);
        `;
        await pool.query(likeInsertSQL, [commentIdx, sessionUserIdx]);

        // 댓글의 좋아요 수 증가
        const updateLikesCountSQL = `
            UPDATE scheduler.comment
            SET likes_count = likes_count + 1
            WHERE comment_idx = $1;
        `;
        await pool.query(updateLikesCountSQL, [commentIdx]);

        // 결과 설정
        result.success = true;
        result.message = "댓글 좋아요 추가 성공";
    } catch (e) {
        result.message = e.message;
    } finally {
        res.send(result);
    }
});

// 댓글 좋아요 취소
router.delete('/:commentIdx/like', async (req, res) => {
    const commentIdx = req.params.commentIdx; // 댓글 ID
    const sessionUserIdx = req.session.userIdx; // 세션에 저장된 사용자 ID
    console.log("댓글 좋아요 취소 세션: ", sessionUserIdx)


    const result = {
        "success": false,
        "message": "",
        "data": null
    };

    try {
        // 세션에 사용자 ID가 없는 경우
        // if (!sessionUserIdx) {
        //     throw new Error("잘못된 접근입니다.");
        // }

        // 좋아요 여부 확인
        const likeCheckSQL = `
            SELECT * FROM scheduler.comment_likes
            WHERE comment_idx = $1 AND user_idx = $2;
        `;
        const likeCheckResult = await pool.query(likeCheckSQL, [commentIdx, sessionUserIdx]);

        if (likeCheckResult.rows.length === 0) {
            throw new Error("댓글에 좋아요를 누른 적이 없습니다.");
        }

        // DB통신: 댓글 좋아요 삭제
        const deleteLikeSQL = `
            DELETE FROM scheduler.comment_likes
            WHERE comment_idx = $1 AND user_idx = $2;
        `;
        await pool.query(deleteLikeSQL, [commentIdx, sessionUserIdx]);

        // 댓글의 좋아요 수 감소
        const updateLikesCountSQL = `
            UPDATE scheduler.comment
            SET likes_count = likes_count - 1
            WHERE comment_idx = $1 likes_count > 0;
        `;
        await pool.query(updateLikesCountSQL, [commentIdx]);

        // 결과 설정
        result.success = true;
        result.message = "댓글 좋아요를취소 성공";

    } catch (error) {
        result.message = error.message;
    } finally {
        res.send(result);
    }
});

// export 작업
module.exports = router