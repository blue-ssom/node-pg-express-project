const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// 연결 확인 함수
async function checkDatabaseConnection() {
    try {
        // 데이터베이스에 연결
        const client = await pool.connect();
        // 데이터베이스에 연결된 경우
        console.log('디비 연결 성공');
    } catch (error) {
        // 오류 처리
        console.error('디비 연결 안됨:', error.message);
    }
}


checkDatabaseConnection();

module.exports = pool;
