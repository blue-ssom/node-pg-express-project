// 게시글과 관련된 API
const router = require("express").Router() // express 안에 있는 Router만 import
const pool = require("../../database/db");
const utils = require('../utils');


// 게시글 보기
router.get('/all', async(req, res) => {
    const sessionUserIdx = req.session.userIdx; // 세션에 저장된 사용자 idx
    console.log("게시글 보기 세션: ", sessionUserIdx)

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
        const sql = `SELECT * FROM scheduler.post`;
        const data = await pool.query(sql);

        // DB 후처리
        const row = data.rows

        if (row.length === 0) {
            throw new Error("게시글이 존재하지 않습니다.");
        }
        
        // 결과 설정
        result.success = true;
        result.message = "게시글 보기 성공";
        result.data = row[0];

    } catch (e) {
    result.message = e.message;
    } finally {
    res.send(result);
    }
});

// 게시글 추가
router.post('/', async(req, res) => {
    const sessionUserIdx = req.session.userIdx; // 세션에 저장된 사용자 idx
    console.log("게시글 추가하기 세션: ", sessionUserIdx)
    
    const { title, content, categoryIdx } = req.body
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

        checkTitle(title);
        checkContent(content);

        // DB통신
        const postInsertInfoSQL = `
        INSERT INTO scheduler.post (user_idx, title, content, creationdate, updationdate) 
        VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `;
        const postInsertResult = await pool.query(postInsertInfoSQL, [sessionUserIdx, title, content]);
        const postIdx = postInsertResult.rows[0].post_idx; // 새로 추가된 게시글의 ID

        // 카테고리 추가
        const categoryInsertSQL = `
            INSERT INTO scheduler.post_category (post_idx, category_idx)
            VALUES ($1, $2);
        `;
        await pool.query(categoryInsertSQL, [postIdx, categoryIdx]);

        result.success = true;
        result.message = "게시글 작성 성공";
        result.data = updatePostResult.rows[0];
    } catch(e) {
        result.message = e.message;
    } finally {
        res.send(result);
    }
});

// 게시글 수정
router.put('/:postIdx', async(req, res) => {
    const postIdx = req.params.postIdx; // 사용자가 입력한 PostIdx
    const sessionUserIdx = req.session.userIdx; // 세션에 저장된 사용자 idx
    console.log("게시글 수정하기 세션: ", sessionUserIdx)
    
    const { title, content, categoryIdx } = req.body
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

        checkTitle(title);
        checkContent(content);

        // DB통신
        const updatePostSQL = `
            UPDATE scheduler.post
            SET title = $1, content = $2, updationDate = CURRENT_TIMESTAMP
            WHERE post_idx = $3 AND user_idx = $4
        `;
        const updatePostResult = await pool.query(updatePostSQL, [title, content, postIdx, sessionUserIdx]);

        // 카테고리 수정
        const updateCategorySQL = `
            UPDATE scheduler.post_category
            SET category_idx = $1
            WHERE post_idx = $2
        `;
        const updateCategoryResult = await pool.query(updateCategorySQL, [categoryIdx, postIdx]);

        // DB 후처리
        const row = updatePostResult.rows;

        if (row.length === 0) {
            throw new Error("게시글 수정에 실패하였습니다.");
        }

        result.success = true;
        result.message = "게시글 수정 성공";
        result.data = postInsertResult.rows[0];
        
    } catch(e) {
        result.message = e.message;
    } finally {
        res.send(result);
    }

});

// 게시글 삭제
router.delete('/:postIdx', async(req, res) => {
    const postIdx = req.params.postIdx; // 사용자가 입력한 PostIdx
    const sessionUserIdx = req.session.userIdx; // 세션에 저장된 사용자 idx
    console.log("게시글 수정하기 세션: ", sessionUserIdx)
    
    const { title, content } = req.body
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
        const deletePostSQL = `
            DELETE FROM scheduler.post
            WHERE post_id = $1 AND user_idx = $2
        `;
        const deletePostResult = await pool.query(deletePostSQL, [postIdx, sessionUserIdx]);

        // DB 후처리
        const row = deletePostResult.rows;

        if (row.length === 0) {
            throw new Error("게시글 삭제에 실패하였습니다.");
        }

        result.success = true;
        result.message = "게시글 삭제 성공";
        
    } catch(e) {
        result.message = e.message;
    } finally {
        res.send(result);
    }
});

// 게시글 좋아요
router.post('/:postIdx/like', async (req, res) => {
    const postIdx = req.params.postIdx; // 게시글 ID
    const sessionUserIdx = req.session.userIdx; // 세션에 저장된 사용자 idx
    const result = {
        "success": false,
        "message": "",
        "data": null
    };

    try {
        // 예외처리: 세션에 사용자 idx가 없는 경우
        // if (!sessionUserIdx) {
        //     throw new Error("잘못된 접근입니다.");
        // }

        // 좋아요 여부 확인
        const likeCheckSQL = `SELECT * FROM scheduler.post_likes WHERE post_idx = $1 AND user_idx = $2;`;
        const likeCheckResult = await pool.query(likeCheckSQL, [postIdx, sessionUserIdx]);

        if (likeCheckResult.rows.length > 0) {
            throw new Error("이미 좋아요를 누르셨습니다.");
        }

        // DB통신
        const likeInsertSQL = `INSERT INTO scheduler.post_likes (post_idx, user_idx) VALUES ($1, $2);`;
        const likeInsertResult = await pool.query(likeInsertSQL, [postId, sessionUserIdx]);

        // DB 후처리
        const row = likeInsertResult.rows;

        if (row.length === 0) {
            throw new Error("게시글 좋아요 누르기에 실패하였습니다.");
        }

        // 결과 설정
        result.success = true;
        result.message = "게시글 좋아요 누르기 성공";
        result.data = insertedLike;

    } catch (e) {
        result.message = e.message;
    } finally {
        res.send(result);
    }
});

// 게시글 좋아요 취소
router.delete('/:postId/like', async (req, res) => {
    const sessionUserIdx = req.session.userIdx; // 세션에 저장된 사용자 idx
    const postIdx = req.params.postIdx; // 게시글 ID
    const result = {
        "success": false,
        "message": "",
        "data": null
    };

    try {
        // 예외처리: 세션에 사용자 idx가 없는 경우
        // if (!sessionUserIdx) {
        //     throw new Error("잘못된 접근입니다.");
        // }

        // DB통신: 게시글 좋아요 취소
        const likeDeleteSQL = `
            DELETE FROM scheduler.post_likes
            WHERE post_idx = $1 AND user_idx = $2;
        `;
        const likeDeleteResult = await pool.query(likeDeleteSQL, [postIdx, sessionUserIdx]);

        // DB 후처리
        const row = likeDeleteResult.rows;

        if (row.length === 0) {
            throw new Error("게시글 좋아요 누르기에 실패하였습니다.");
        }

        // 결과 설정
        result.success = true;
        result.message = "게시글 좋아요 취소 성공";
    } catch (e) {
        result.message = e.message;
    } finally {
        res.send(result);
    }
});

// export 작업
module.exports = router