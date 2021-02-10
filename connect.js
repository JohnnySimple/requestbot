let mysql = require('mysql');

let con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'nodedb'
});

con.connect(function (err) {
    if(err) {
        return console.error('error: ' + err.message);
    }
    console.log("connected");
});