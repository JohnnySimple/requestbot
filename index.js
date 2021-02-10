const SlackBot = require('slackbots');
const axios = require('axios');
const dotenv = require('dotenv');
var nodemailer = require('nodemailer');

// var mysql = require('mysql');

// let con = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: '',
//     database: 'nodedb'
// });

// con.connect(function (err) {
//     if(err) {
//         return console.error('error: ' + err.message);
//     }
//     console.log("connected");
// });

require('connect.js');

// querying database 
let sql = "SELECT * from Test";
con.query(sql, (error, results, fields) => {
    if(error) {
        return console.error(error.message);
    }
    console.log(results);
});

dotenv.config();

const bot = new SlackBot({
    token: `${process.env.BOT_TOKEN}`,
    // token: "xoxb-1648733474034-1653562351559-BwB67oSaKRRcxBeHdHpjdK0c",
    name: 'requestbot'
});

// step variable to get current state of user conversation with bot
let step = "";
let user_name = "";
let user_requests = [];
let available_requests = {
    '1':'Office Chair',
    '2':'Office Table',
    '3':'Conference Room',
    '4':'Laptop',
    '5':'Turbo Net',
    '6':'Monitor'
};

bot.on('start', () => {
    const params = {
        icon_emoji: ':robot_face:'
    }

    axios.get(
        'https://slack.com/api/users.list', 
        {
            headers: {
                "authorization" : "Bearer xoxp-1648733474034-1645646696901-1662881297974-6d2a5a2882268378ee6b37fbeca89dd2"
            }
        })
        .then(res => {
            const results = res.data;
            // console.log(results);
            results.members.map(item => {
                if(item.is_bot == false) {
                    // console.log(item.name);
                    bot.postMessageToUser(
                        `${item.name}`,
                        `Hello @${item.name}! You can call me @requestsBot. As my name goes, you can make all your requests through me.\
                        \nFeel free to dm me. Please chat me with "@requestsBot" followed by your message.`,
                        params
                    )
                }
            });
        })

    
});


bot.on('error', (err) => {
    console.log(err);
});

// Message Handler
bot.on('message', data => {
    if(data.type !== 'message') {
        return;
    }
    if(data.subtype) {
        return;
    }

    // console.log(data);
    handleMessage(data.user, data.text.toLowerCase());
});


// Handle message
handleMessage = (user, msg) => {

    if(msg.includes('hi') || msg.includes('hello') || msg.includes('hey')) {
        const params = {
            icon_emoji: ':smiley:'
        }

        axios.get(
            'https://slack.com/api/users.profile.get', 
            {
                headers: {
                    "authorization" : "Bearer xoxp-1648733474034-1645646696901-1662881297974-6d2a5a2882268378ee6b37fbeca89dd2"
                },
                params: {
                    user : `${user}`
                }
            })
            .then(res => {
                const results = res.data['profile']['real_name_normalized'];
                const display_name = res.data['profile']['display_name'];
                user_name = res.data['profile']['real_name_normalized'];
                // console.log(results);

                bot.postMessageToUser(
                    `${results}`,
                    `Hello @${display_name}. How can I help you today? Please select from the list below by number\
                    \n1.Request Office Chair\n2.Request Office Table\n3.Book conference room\
                    \n4.Request a Laptop\n5.Request a Turbo Net\n6.Request a Monitor\
                    \nPlease separate multiple selections with a comma.`,
                    params
                )
            });

            step = "1";
    
    }else if((msg.includes('1') || msg.includes('2') || msg.includes('3') || msg.includes('4') ||
            msg.includes('5') || msg.includes('6')) && step == "1") {
    // }else if(msg.includes(' 1') && step == '1') {

        // console.log(`msg: ${msg}`);
        // requests_string = msg.split(' ')[1];
        // user_requests = requests_string.split(',');
        user_requests = msg.split(',');
        // user_requests = msg;
        const params = {
            icon_emoji: ':smiley:'
        }
        

        // bot.postMessageToUser(
        //     `${user_name}`,
        //     // `You want to request for ${available_requests['1']}. Please reply 'yes' to confirm`,
        //     `You want to request for\n ${user_requests.map(item => {
        //         available_requests[item]
        //     })}\n. Please reply 'yes' to confirm or 'exit' to cancel.`,
        //     params
        // )
        axios.get(
            'https://slack.com/api/users.profile.get', 
            {
                headers: {
                    "authorization" : "Bearer xoxp-1648733474034-1645646696901-1662881297974-6d2a5a2882268378ee6b37fbeca89dd2"
                },
                params: {
                    user : `${user}`
                }
            })
            .then(res => {
                const results = res.data['profile']['real_name_normalized'];
                const display_name = res.data['profile']['display_name'];

                bot.postMessageToUser(
                    `${results}`,
                    `You want to request for:`,
                    params
                );
                user_requests.map(item => {
                    // console.log(available_requests[item]);
                    bot.postMessageToUser(
                        `${results}`,
                        `${available_requests[item]}`,
                        params
                    )
                });
                bot.postMessageToUser(
                    `${results}`,
                    `Please reply 'yes' to confirm or 'exit' to cancel`,
                    params
                )
            })

        step = "2";
    } else if(msg.includes('yes') && step == '2') {
        // send email with user requests to Joseph
        const params = {
            icon_emoji: ':smiley:'
        }

        // var transporter = nodemailer.createTransport({
        //     service: 'gmail',
        //     auth: {
        //       user: 'obengjohnsonboateng@gmail.com',
        //       pass: '0543573800'
        //     }
        //   });
          
        //   var mailOptions = {
        //     from: 'obengjohnsonboateng@gmail.com',
        //     to: 'obengboatengjohnson@gmail.com',
        //     subject: 'REQUEST MADE FROM SLACK via requestBot',
        //     text: 'That was easy!'
        //   };
          
        //   transporter.sendMail(mailOptions, function(error, info){
        //     if (error) {
        //       console.log(error);
        //     } else {
        //       console.log('Email sent: ' + info.response);
        //     }
        //   });

          axios.get(
            'https://slack.com/api/users.profile.get', 
            {
                headers: {
                    "authorization" : "Bearer xoxp-1648733474034-1645646696901-1662881297974-6d2a5a2882268378ee6b37fbeca89dd2"
                },
                params: {
                    user : `${user}`
                }
            })
            .then(res => {
                const results = res.data['profile']['real_name_normalized'];
                const display_name = res.data['profile']['display_name'];

                bot.postMessageToUser(
                    `${results}`,
                    `Your request has been sent. You will be contacted by the team.`,
                    params
                )
            })
        
    } 
    // else if(msg.includes(' cancel') && step == '2') {
    //     // cancel request
    //     const params = {
    //         icon_emoji: ':smiley:'
    //     }

    //     bot.postMessageToUser(
    //         `${user_name}`,
    //         `You have cancelled your request. You can always initiate a request by sending me hi.`,
    //         params
    //     )

    //     step = "";
    // }
    
}