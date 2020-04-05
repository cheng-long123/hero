
module.exports = (sql, params, callback) => {
    const mysql = require('mysql');
    const conn = mysql.createConnection({
        host: 'localhost',
        port: '3306',
        user: 'root',
        password: '123456',
        database: 'heros_user'
    })
    conn.connect();
    conn.query(sql, params, callback);
    conn.end()
}