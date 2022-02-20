const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();
const mysql = require('mysql');
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'katedb'
});
db.connect(function (err) {
    if (err) throw err;
    console.log("KATE Database Connected!");
});
module.exports = db;
const SecretKeyAPI = '1...0_Pakistani_$_i_No_one';
///Token Format
///Authorization: Bearer <acces_token>

app.get('/api/get', (req, res) => {

    res.json({ message: 'welcome to get API' });

});
///create token for a user
app.post('/api/login', (req, res) => {
    const user = {
        username: 'mehran1234',
        email: 'mehran@metra.dev',
    }
    jwt.sign((user), SecretKeyAPI
        // , { expiresIn: '30s' }
        , (err, token) => {
            res.json(token);


        });
    // res.json({ message: 'welcome to post API' });

});
app.post('/api/posts', verifyFunction, (req, res) => {

    jwt.verify(req.token, SecretKeyAPI, (err, authData) => {
        if (err) { res.sendStatus(403) } else {
            let sql = `SELECT * FROM  blogs_data`;
            db.query(sql, (err, result) => {
                if (err) throw err;
                console.log(`API Successfuly Loaded  by ${authData['email']}`);
                res.json(result);
            });
            // res.json({
            //     message: 'post created',
            //     authData
            // });
        }
        // res.json(token);
    });

    // res.json({ message: 'welcome to post API' });

});

/// signIn 
app.post('/signIn', (req, res) => {
    const user = {
        email: 'developer@metra.com',
        password: 'kate12345',
    }
    let checkUser = `SELECT COUNT(*) FROM blog_admin_tb WHERE email_at='${user['email']}' AND pass_at='${user['password']}'`;
    let getAdminData = `SELECT name_at,role_at,email_at FROM blog_admin_tb WHERE email_at='${user['email']}' AND pass_at='${user['password']}'`;
    db.query(checkUser, (err, result) => {
        if (err) { throw err; }

        else {
            console.log(result);
            if (result[0]['COUNT(*)'] > 0) {
                res.status(200);
                db.query(getAdminData, (errr, resultdata) => {
                    if (errr) { throw errr; }
                    else {
                        const result = {
                            name: resultdata[0]['name_at'],
                            role: resultdata[0]['role_at'],
                        };

                        jwt.sign((user), 'secretkey'
                            // , { expiresIn: '30s' }
                            , (err, token) => {
                                res.json({ token, result });
                            });

                        console.log("Success");
                    }
                });

            }
            else {
                res.status(409);
                res.send('Email password does not Exist')
            }
        }

    })
});
function verifyFunction(req, res, next) {
    const bearerHeader = req.headers['authorization'];
    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(' ');
        //get token from array 
        const bearerToken = bearer[1];
        req.token = bearerToken;
        next();
    } else {
        res.sendStatus(403);
    }

}

app.listen(5000, () => { console.log('server listening to port 5000') });