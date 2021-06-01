const SlackBot = require('slackbots');
const axios = require('axios');
const dotenv = require('dotenv');
var nodemailer = require('nodemailer');

// const googleCalendar = require('./gcalendar/addEvent');
// let calendar = new googleCalendar();

// const gcal = require('./gcalendar/index');

const googleCal = require('./gcalendar/demo');
// let cal = new googleCal('Lucy Slackbot Testing', 'Testing out our new slack bot', '2021-02-19T17:00:00', '2021-02-19T19:10:00', 'johnson.obeng@icassetmanagers');

var mysql = require('mysql');

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

// const con = require('./connect.js');

dotenv.config();

const bot = new SlackBot({
    token: `${process.env.BOT_TOKEN}`,
    name: 'lucy'
});

// step variable to get current state of user conversation with bot
let step = "";
let steps = {};
let currentStage = "";
let currentStages = {};
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

// message everyone in workspace when this bot is started by DMing
// bot.on('start', () => {
//     const params = {
//         icon_emoji: ':information_source:'
//     }

//     axios.get(
//         'https://slack.com/api/users.list', 
//         {
//             headers: {
//                 "authorization" : `Bearer ${process.env.USER_TOKEN}`
//             }
//         })
//         .then(res => {
//             const results = res.data;
//             // console.log(results);
//             results.members.map(item => {
//                 if(item.is_bot == false) {
//                     // console.log(item.name);
//                     bot.postMessageToUser(
//                         `${item.name}`,
//                         `Hello @${item.profile.display_name}! You can call me Lucy. You can make all your requests through me.\
//                         \nFeel free to dm me.`,
//                         params
//                     )
//                 }
//             });
//         })

//         // calendar.addEvent('Lucy Slackbot Testing', 'Testing out our new slack bot', '2021-02-18T14:00:00-07:00', '2021-02-18T15:10:00-07:00', 'johnson.obeng@icassetmanagers');
//         // add google calendar event
//         // gcal('Lucy Slackbot Testing', 'Testing out our new slack bot', '2021-02-18T14:00:00-07:00', '2021-02-18T15:10:00-07:00', 'johnson.obeng@icassetmanagers');
//         // gcal();
//         // cal.action('Lucy Slackbot Testing', 'Testing out our new slack bot', '2021-02-18T14:00:00', '2021-02-18T15:10:00', 'johnson.obeng@icassetmanagers');
//         // cal.action();

//         // var transporter = nodemailer.createTransport({
//         //     service: 'gmail',
//         //     auth: {
//         //       user: 'obengjohnsonboateng@gmail.com',
//         //       pass: '0543573800'
//         //     }
//         //   });
          
//         //   var mailOptions = {
//         //     from: 'obengjohnsonboateng@gmail.com',
//         //     to: 'obengboatengjohnson@gmail.com',
//         //     subject: 'REQUEST MADE FROM SLACK VIA LUCY',
//         //     text: 'That was easy!'
//         //   };
        
//         //   transporter.sendMail(mailOptions, function(error, info){
//         //     if (error) {
//         //       console.log(error);
//         //     } else {
//         //       console.log('Email sent: ' + info.response);
//         //     }
//         //   });
// });


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

    handleMessages(data.user, data.text.toLowerCase());
});

/**
 * this function is exported to api/starter.js to return response
 * from slack block Kit anytime a user interacts with it
 */
 const getDataFromApi = (user, msg) => {
    console.log(user + ' ' + msg);
    handleMessages(user, msg);
}

// Handle message
const handleMessages = (user, msg) => {

    if(msg.includes('hi') || msg.includes('hello') || msg.includes('hey') || msg.includes('start') || msg.includes('restart')) {
        
        displayServices(user, msg);
        steps[user] = "1";
    
    }else if((msg.includes('1') || msg.includes('item')) && steps[user] == "1") {
        
        itemRequest(user, msg);
        steps[user] = "2";
        currentStages[user] = "itemrequest";

    } else if((msg.includes('2') || msg.includes('room')) && steps[user] == "1") {

        roomRequest(user, msg);
        steps[user] = "2";
        currentStages[user] = "roomrequest";

    } else if((msg.includes('1') || msg.includes('projector')) && steps[user] == '2' && currentStages[user] == "itemrequest") {

        projectorSelected(user, msg);
        steps[user] = "3";
        currentStages[user] = "projectorselected";

    } else if((msg.includes('2') || msg.includes('pointer')) && steps[user] == '2' && currentStages[user] == "itemrequest") {

        projectorPointerSelected(user, msg);
        steps[user] = "3";
        currentStages[user] = "projectorpointerselected";

    } else if((msg.includes('3') || msg.includes('turbonet')) && steps[user] == '2' && currentStages[user] == "itemrequest") {

        turbonetSelected(user, msg);
        steps[user] = "3";
        currentStages[user] = "turbonetselected";

    } else if((msg.includes('1') || msg.includes('board')) && steps[user] == '2' && currentStages[user] == "roomrequest") {
        // for board room selection

        boardRoomSelected(user, msg);
        steps[user] = "3";
        currentStages[user] = "boardroomselected";


    } else if(msg.match(/^\d{4}[./-]\d{2}[./-]\d{2}[ ]\d{1,2}[:]\d{2}[, ]\d{4}[./-]\d{2}[./-]\d{2}[ ]\d{1,2}[:]\d{2}$/) && steps[user] == '3' && currentStages[user] == 'projectorselected') {
        let res = projectorBookingDate(user, msg);
        if(res == true) {
            steps[user] = "4";
            currentStages[user] = "projectorbookingconfirm";
        }

    } else if(msg.match(/^\d{4}[./-]\d{2}[./-]\d{2}[ ]\d{1,2}[:]\d{2}[, ]\d{4}[./-]\d{2}[./-]\d{2}[ ]\d{1,2}[:]\d{2}$/) && steps[user] == '3' && currentStages[user] == 'projectorpointerselected') {
        let res = projectorPointerBookingDate(user, msg);
        if(res == true) {
            steps[user] = "4";
            currentStages[user] = "projectorpointerbookingconfirm";
        }
    } else if(msg.match(/^\d{4}[./-]\d{2}[./-]\d{2}[ ]\d{1,2}[:]\d{2}[, ]\d{4}[./-]\d{2}[./-]\d{2}[ ]\d{1,2}[:]\d{2}$/) && steps[user] == '3' && currentStages[user] == 'boardroomselected') {

        let res = boardRoomBookingDate(user, msg);
        if(res == true) {
            steps[user] = "4";
            currentStages[user] = "boardroombookingconfirm";
        }

    } else if((msg.includes('2') || msg.includes('cubicle')) && steps[user] == '2' && currentStages[user] == "roomrequest") {
        // for office cubicle selection

        officeCubicleSelected(user, msg);
        steps[user] = "3";
        currentStages[user] = "officecubicleselected";

    } else if(msg.match(/^\d{4}[./-]\d{2}[./-]\d{2}[ ]\d{1,2}[:]\d{2}[, ]\d{4}[./-]\d{2}[./-]\d{2}[ ]\d{1,2}[:]\d{2}$/) && steps[user] == '3' && currentStages[user] == 'officecubicleselected') {

        // for office cubicle booking
        let res = officeCubicleBookingDate(user, msg);
        if(res == true) {
            steps[user] = "4";
            currentStages[user] = "officecubiclebookingconfirm";
        }

    } else if(msg.includes('yes') && steps[user] == '3') {
        displaySuccessMessage(user, msg);
        
    } 
    else if(msg.includes('cancel') && steps[user] != "") {

        // cancel request
        cancelRequest(user, msg);
        steps[user] = "";
    }
    // TODO: Add appreciation condition (thanks, thank you)
    
}



// functions

const displayServices = (user, msg) => {
    const params = {
        icon_emoji: ':information_source:'
    }

    axios.get(
        'https://slack.com/api/users.profile.get', 
        {
            headers: {
                "authorization" : `Bearer ${process.env.USER_TOKEN}`
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
                \n1.Request Item\n2.Book Room`,
                params
            )
        });
}


const itemRequest = (user, msg) => {
    user_requests = msg.split(',');
    const params = {
        icon_emoji: ':information_source:'
    }
    
    axios.get(
        'https://slack.com/api/users.profile.get', 
        {
            headers: {
                "authorization" : `Bearer ${process.env.USER_TOKEN}`
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
                `Please select item by number\n1. Projector\n2. Projector pointer\n3. Turbonet`,
                params
            );

            // bot.postMessageToUser(
            //     `${results}`,
            //     `You want to request for:`,
            //     params
            // );
            // user_requests.map(item => {
            //     // console.log(available_requests[item]);
            //     bot.postMessageToUser(
            //         `${results}`,
            //         `${available_requests[item]}`,
            //         params
            //     )
            // });
            // bot.postMessageToUser(
            //     `${results}`,
            //     `Please reply 'yes' to confirm or 'exit' to cancel`,
            //     params
            // )
        })
}

const itemSelected = (user, msg) => {
    let selectedItem = "";
    // query database for item selected
    let sql = `SELECT * from items WHERE id=${msg}`;
    con.query(sql, (error, results, fields) => {
        if(error) {
            return console.error(error.message);
        }
        // console.log(results[0]['Name']);
        selectedItem = results[0]['Name'];
    });
    const params = {
        icon_emoji: ':information_source:'
    }

    axios.get(
        'https://slack.com/api/users.profile.get', 
        {
            headers: {
                "authorization" : `Bearer ${process.env.USER_TOKEN}`
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
                `You want to request for ${selectedItem}. Please enter 'yes' to confirm. You can enter 'cancel' to retract.`,
                params
            )
        })
}


const projectorSelected = (user, msg) => {
    let selectedItem = "";
    // query database for item selected
    let sql = `SELECT * from items WHERE id=${msg}`;
    con.query(sql, (error, results, fields) => {
        if(error) {
            return console.error(error.message);
        }
        // console.log(results[0]['Name']);
        selectedItem = results[0]['Name'];
    });
    const params = {
        icon_emoji: ':information_source:',
        blocks: [{"type": "section", "text": {"type": "mrkdwn", "text": "Please pick starting date"},
                    "accessory": {"type": "datepicker", "initial_date": "2021-01-01",
                    "placeholder": {"type": "plain_text","text": "Select a date","emoji": true},
                    "action_id": "datepicker_action"}}]
    }

    const blocks = [{"type": "section", "text": {"type": "plain_text", "text": "Hello world"}}];

    axios.get(
        'https://slack.com/api/users.profile.get', 
        {
            headers: {
                "authorization" : `Bearer ${process.env.USER_TOKEN}`
            },
            params: {
                user : `${user}`
            }
        })
        .then(res => {
            const results = res.data['profile']['real_name_normalized'];
            const display_name = res.data['profile']['display_name'];

            // bot.postMessageToUser(
            //     `${results}`,
            //     `Please enter start date/time and end data/time your want to book. (Format: yyyy-mm-dd hr:min,yyyy-mm-dd hr:min)`,
            //     params
            // )

            bot.postMessageToUser(
                `${results}`,
                `date picker`,
                params
            )
        })
}

const projectorBookingDate = (user, msg) => {

    let start_date_time = msg.split(',')[0];
    let start_date = start_date_time.split(' ')[0];
    let start_time = start_date_time.split(' ')[1];

    let end_date_time = msg.split(',')[1];
    let end_date = end_date_time.split(' ')[0];
    let end_time = end_date_time.split(' ')[1];

    let resultsCount = null;
    let returnedBookedUser = null;
    let returnedBookedStartDate = null;
    let returnedBookedEndDate = null;

    // check if there is a booking within the same time user wants to book
    let sql = `SELECT * from item_bookings WHERE item_id=1 AND ((start_date_time <= '${start_date_time}' AND end_date_time >= '${start_date_time}') OR (start_date_time <= '${end_date_time}' AND end_date_time >= '${end_date_time}'))`;
    con.query(sql, (error, results, fields) => {
        if(error) {
            return console.error(error.message);
        }
        // console.log(results);
        // console.log(results.length);
        resultsCount = results.length;
        if(resultsCount > 0) {
            returnedBookedUser = results[0]['user_email'];
            returnedBookedStartDate = results[0]['start_date_time'];
            returnedBookedEndDate = results[0]['end_date_time'];
        }
        
        // console.log(`start date time: ${results[0]['start_date_time']}`);
        // console.log(`end date time: ${results[0]['end_date_time']}`);
        // selectedRoom = results[0]['Name'];
    });

    const params = {
        icon_emoji: ':information_source:'
    }

    axios.get(
        'https://slack.com/api/users.profile.get', 
        {
            headers: {
                "authorization" : `Bearer ${process.env.USER_TOKEN}`
            },
            params: {
                user : `${user}`
            }
        })
        .then(res => {
            const results = res.data['profile']['real_name_normalized'];
            const display_name = res.data['profile']['display_name'];
            const user_email = res.data['profile']['email'];

            // check if query returned a booking withing the same time frame
            if(resultsCount > 0) {
                bot.postMessageToUser(
                    `${results}`,
                    `Please the projector has already been booked within your time frame by ${returnedBookedUser} from ${returnedBookedStartDate} to ${returnedBookedStartDate}.\
                     \nPlease choose a different date to book.`,
                    params
                );
                return false;
            } else {
                let sql = `INSERT into item_bookings (item_id, user_email, start_date_time, end_date_time)
                            VALUES(1, '${user_email}', '${start_date_time}', '${end_date_time}')`;
                con.query(sql, (error) => {
                    if(error) {
                        bot.postMessageToUser(
                            `${results}`,
                            `Sorry! An error occurred with your booking! Please contact the IT team.`,
                            params
                        );
                        return console.error(error.message);
                    } else {
                        bot.postMessageToUser(
                            `${results}`,
                            `Great!, the projector is available on your selected date and time.\nYour booking is successful!.`,
                            params
                        );

                        let summary = 'Projector Booked';
                        let description = 'Booked projector from slackbot app';
                        s_date = start_date + 'T' + (start_time + ':00');
                        e_date = end_date + 'T' + (end_time + ':00');
                        
                        console.log(`start-date:${s_date}, end-date:${e_date}`);
                        // instantiate a new google calendar object
                        let cal = new googleCal(summary, description, s_date, e_date, user_email);
                        // add event to calendar
                        cal.action();

                        return true;
                    }
                });

            }

        })
}

const projectorPointerSelected = (user, msg) => {
    let selectedItem = "";
    // query database for item selected
    let sql = `SELECT * from items WHERE id=${msg}`;
    con.query(sql, (error, results, fields) => {
        if(error) {
            return console.error(error.message);
        }
        // console.log(results[0]['Name']);
        selectedItem = results[0]['Name'];
    });
    const params = {
        icon_emoji: ':information_source:'
    }

    axios.get(
        'https://slack.com/api/users.profile.get', 
        {
            headers: {
                "authorization" : `Bearer ${process.env.USER_TOKEN}`
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
                `Please enter start date/time and end data/time your want to book. (Format: yyyy-mm-dd hr:min,yyyy-mm-dd hr:min)`,
                params
            )
        })
}

const projectorPointerBookingDate = (user, msg) => {

    let start_date_time = msg.split(',')[0];
    let start_date = start_date_time.split(' ')[0];
    let start_time = start_date_time.split(' ')[1];

    let end_date_time = msg.split(',')[1];
    let end_date = end_date_time.split(' ')[0];
    let end_time = end_date_time.split(' ')[1];

    let resultsCount = null;
    let returnedBookedUser = null;
    let returnedBookedStartDate = null;
    let returnedBookedEndDate = null;

    // check if there is a booking within the same time user wants to book
    let sql = `SELECT * from item_bookings WHERE item_id=2 AND ((start_date_time <= '${start_date_time}' AND end_date_time >= '${start_date_time}') OR (start_date_time <= '${end_date_time}' AND end_date_time >= '${end_date_time}'))`;
    con.query(sql, (error, results, fields) => {
        if(error) {
            return console.error(error.message);
        }
        resultsCount = results.length;
        if(resultsCount > 0) {
            returnedBookedUser = results[0]['user_email'];
            returnedBookedStartDate = results[0]['start_date_time'];
            returnedBookedEndDate = results[0]['end_date_time'];
        }
    });

    const params = {
        icon_emoji: ':information_source:'
    }

    axios.get(
        'https://slack.com/api/users.profile.get', 
        {
            headers: {
                "authorization" : `Bearer ${process.env.USER_TOKEN}`
            },
            params: {
                user : `${user}`
            }
        })
        .then(res => {
            const results = res.data['profile']['real_name_normalized'];
            const display_name = res.data['profile']['display_name'];
            const user_email = res.data['profile']['email'];

            // check if query returned a booking withing the same time frame
            if(resultsCount > 0) {
                bot.postMessageToUser(
                    `${results}`,
                    `Please the projector pointer has already been booked within your time frame by ${returnedBookedUser} from ${returnedBookedStartDate} to ${returnedBookedStartDate}.\
                     \nPlease choose a different date to book.`,
                    params
                );
                return false;
            } else {
                let sql = `INSERT into item_bookings (item_id, user_email, start_date_time, end_date_time)
                            VALUES(2, '${user_email}', '${start_date_time}', '${end_date_time}')`;
                con.query(sql, (error) => {
                    if(error) {
                        bot.postMessageToUser(
                            `${results}`,
                            `Sorry! An error occurred with your booking! Please contact the IT team.`,
                            params
                        );
                        return console.error(error.message);
                    } else {
                        bot.postMessageToUser(
                            `${results}`,
                            `Great!, the projector pointer is available on your selected date and time.\nYour booking is successful!.`,
                            params
                        );

                        let summary = 'Projector Pointer Booked';
                        let description = 'Booked projector pointer from slackbot app';
                        s_date = start_date + 'T' + (start_time + ':00');
                        e_date = end_date + 'T' + (end_time + ':00');
                        
                        console.log(`start-date:${s_date}, end-date:${e_date}`);
                        // instantiate a new google calendar object
                        let cal = new googleCal(summary, description, s_date, e_date, user_email);
                        // add event to calendar
                        cal.action();

                        return true;
                    }
                });

            }

        })
}

const turbonetSelected = (user, msg) => {
    const params = {
        icon_emoji: ':information_source:'
    }

    axios.get(
        'https://slack.com/api/users.profile.get', 
        {
            headers: {
                "authorization" : `Bearer ${process.env.USER_TOKEN}`
            },
            params: {
                user : `${user}`
            }
        })
        .then(res => {
            const results = res.data['profile']['real_name_normalized'];
            const display_name = res.data['profile']['display_name'];
            const real_name = res.data['profile']['real_name'];
            const user_email = res.data['profile']['email'];

            bot.postMessageToUser(
                `${results}`,
                `Great! Your turbonet request has been sent to the IT team. You'll be contacted soon.`,
                params
            );

            var maillist = 'obengboatengjohnson@gmail.com, johnson.obeng@icassetmanagers.com, joseph.nyako@icassetmanagers.com';
            var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                  user: 'obengjohnsonboateng@gmail.com',
                  pass: '0543573800'
                }
              });
              
              var mailOptions = {
                from: 'obengjohnsonboateng@gmail.com',
                to: maillist,
                subject: 'TEST REQUEST FOR TURBONET MADE FROM SLACK VIA LUCY',
                text: `Hi Team IT! Please I will like to request for a turbonet\
                \n\nName: ${real_name}\nEmail: ${user_email}\n\nThank you.`
              };
            
              transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                  console.log(error);
                } else {
                  console.log('Email sent: ' + info.response);
                }
              });
        })
}

const roomRequest = (user, msg) => {
    const params = {
        icon_emoji: ':information_source:'
    }

    axios.get(
        'https://slack.com/api/users.profile.get', 
        {
            headers: {
                "authorization" : `Bearer ${process.env.USER_TOKEN}`
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
                `Please select room type by number\n1. Board Room\n2. Office Cubicle`,
                params
            );

        })
}


const boardRoomSelected = (user, msg) => {
    let selectedRoom = "";
    // query database for room selected
    let sql = `SELECT * from rooms WHERE id=${msg}`;
    con.query(sql, (error, results, fields) => {
        if(error) {
            return console.error(error.message);
        }
        selectedRoom = results[0]['Name'];
    });
    const params = {
        icon_emoji: ':information_source:'
    }

    axios.get(
        'https://slack.com/api/users.profile.get', 
        {
            headers: {
                "authorization" : `Bearer ${process.env.USER_TOKEN}`
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
                `Please enter start date/time and end data/time your want to book. (Format: yyyy-mm-dd hr:min,yyyy-mm-dd hr:min)`,
                params
            )
        })
}

const boardRoomBookingDate = (user, msg) => {

    let start_date_time = msg.split(',')[0];
    let start_date = start_date_time.split(' ')[0];
    let start_time = start_date_time.split(' ')[1];

    let end_date_time = msg.split(',')[1];
    let end_date = end_date_time.split(' ')[0];
    let end_time = end_date_time.split(' ')[1];

    let resultsCount = null;
    let returnedBookedUser = null;
    let returnedBookedStartDate = null;
    let returnedBookedEndDate = null;

    // check if there is a booking within the same time user wants to book
    let sql = `SELECT * from room_bookings WHERE room_id=1 AND ((start_date_time <= '${start_date_time}' AND end_date_time >= '${start_date_time}') OR (start_date_time <= '${end_date_time}' AND end_date_time >= '${end_date_time}'))`;
    con.query(sql, (error, results, fields) => {
        if(error) {
            return console.error(error.message);
        }
        resultsCount = results.length;
        if(resultsCount > 0) {
            returnedBookedUser = results[0]['user_email'];
            returnedBookedStartDate = results[0]['start_date_time'];
            returnedBookedEndDate = results[0]['end_date_time'];
        }
    });

    const params = {
        icon_emoji: ':information_source:'
    }

    axios.get(
        'https://slack.com/api/users.profile.get', 
        {
            headers: {
                "authorization" : `Bearer ${process.env.USER_TOKEN}`
            },
            params: {
                user : `${user}`
            }
        })
        .then(res => {
            const results = res.data['profile']['real_name_normalized'];
            const display_name = res.data['profile']['display_name'];
            const real_name = res.data['profile']['real_name'];
            const user_email = res.data['profile']['email'];

            // check if query returned a booking withing the same time frame
            if(resultsCount > 0) {
                bot.postMessageToUser(
                    `${results}`,
                    `Please the board room has already been booked within your time frame by ${returnedBookedUser} from ${returnedBookedStartDate} to ${returnedBookedStartDate}.\
                     \nPlease choose a different date to book.`,
                    params
                );
                return false;
            } else {
                let sql = `INSERT into room_bookings (room_id, user_email, start_date_time, end_date_time)
                            VALUES(1, '${user_email}', '${start_date_time}', '${end_date_time}')`;
                con.query(sql, (error) => {
                    if(error) {
                        bot.postMessageToUser(
                            `${results}`,
                            `Sorry! An error occurred with your booking! Please contact the IT team.`,
                            params
                        );
                        return console.error(error.message);
                    } else {
                        bot.postMessageToUser(
                            `${results}`,
                            `Great!, the board room is available on your selected date and time.\nYour booking is successful!.`,
                            params
                        );

                        // add to google calendar
                        let summary = 'Board Room Booked';
                        let description = 'Booked board room from slackbot app';
                        s_date = start_date + 'T' + (start_time + ':00');
                        e_date = end_date + 'T' + (end_time + ':00');
                        
                        console.log(`start-date:${s_date}, end-date:${e_date}`);
                        // instantiate a new google calendar object
                        let cal = new googleCal(summary, description, s_date, e_date, user_email);
                        // add event to calendar
                        cal.action();

                        // send email to IT Team
                        var maillist = 'obengboatengjohnson@gmail.com, johnson.obeng@icassetmanagers.com, joseph.nyako@icassetmanagers.com';
                        var transporter = nodemailer.createTransport({
                            service: 'gmail',
                            auth: {
                            user: 'obengjohnsonboateng@gmail.com',
                            pass: '0543573800'
                            }
                        });
                        
                        var mailOptions = {
                            from: 'obengjohnsonboateng@gmail.com',
                            to: 'obengboatengjohnson@gmail.com',
                            subject: 'BOARD ROOM BOOKING TEST MADE FROM SLACK VIA LUCY',
                            text: `Hi Team IT! Please I will like to book the board room on the following date\
                            \n${new Date(start_date_time).toUTCString().split(' ').slice(0, 5).join(' ')} to ${new Date(end_date_time).toUTCString().split(' ').slice(0, 5).join(' ')}\
                            \n\nName: ${real_name}\nEmail: ${user_email}\n\nThank you.`
                        };
                        
                        transporter.sendMail(mailOptions, function(error, info){
                            if (error) {
                            console.log(error);
                            } else {
                            console.log('Email sent: ' + info.response);
                            }
                        });

                        return true;
                    }
                });

            }

        })
}

const officeCubicleSelected = (user, msg) => {
    const params = {
        icon_emoji: ':information_source:'
    }

    axios.get(
        'https://slack.com/api/users.profile.get', 
        {
            headers: {
                "authorization" : `Bearer ${process.env.USER_TOKEN}`
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
                `Please enter start date/time and end data/time your want to book. (Format: yyyy-mm-dd hr:min,yyyy-mm-dd hr:min)`,
                params
            )
        })
}


const officeCubicleBookingDate = (user, msg) => {

    let start_date_time = msg.split(',')[0];
    let start_date = start_date_time.split(' ')[0];
    let start_time = start_date_time.split(' ')[1];

    let end_date_time = msg.split(',')[1];
    let end_date = end_date_time.split(' ')[0];
    let end_time = end_date_time.split(' ')[1];

    // check if there is a booking within the same time user wants to book
    let sql = `SELECT * from room_bookings WHERE room_id=2 AND ((start_date_time <= '${start_date_time}' AND end_date_time >= '${start_date_time}') OR (start_date_time <= '${end_date_time}' AND end_date_time >= '${end_date_time}'))`;
    con.query(sql, (error, results, fields) => {
        if(error) {
            return console.error(error.message);
        }
        resultsCount = results.length;
        if(resultsCount > 3) {
            // returnedBookedUser = results[0]['user_email'];
            // returnedBookedStartDate = results[0]['start_date_time'];
            // returnedBookedEndDate = results[0]['end_date_time'];
        }
    });

    const params = {
        icon_emoji: ':information_source:'
    }

    axios.get(
        'https://slack.com/api/users.profile.get', 
        {
            headers: {
                "authorization" : `Bearer ${process.env.USER_TOKEN}`
            },
            params: {
                user : `${user}`
            }
        })
        .then(res => {
            const results = res.data['profile']['real_name_normalized'];
            const display_name = res.data['profile']['display_name'];
            const user_email = res.data['profile']['email'];

            // check if query returned a booking withing the same time frame
            if(resultsCount > 3) {
                bot.postMessageToUser(
                    `${results}`,
                    `Please all office cubicles have already been booked within your time frame.\
                     \nPlease choose a different date to book.`,
                    params
                );
                return false;
            } else {
                let sql = `INSERT into room_bookings (room_id, user_email, start_date_time, end_date_time)
                            VALUES(2, '${user_email}', '${start_date_time}', '${end_date_time}')`;
                con.query(sql, (error) => {
                    if(error) {
                        bot.postMessageToUser(
                            `${results}`,
                            `Sorry! An error occurred with your booking! Please contact the IT team.`,
                            params
                        );
                        return console.error(error.message);
                    } else {
                        bot.postMessageToUser(
                            `${results}`,
                            `Great!, an office cubicle is available on your selected date and time.\nYour booking is successful!.`,
                            params
                        );

                        let summary = 'Office Cubicle Booked';
                        let description = 'Booked an office cubicle from slackbot app';
                        s_date = start_date + 'T' + (start_time + ':00');
                        e_date = end_date + 'T' + (end_time + ':00');
                        
                        console.log(`start-date:${s_date}, end-date:${e_date}`);
                        // instantiate a new google calendar object
                        let cal = new googleCal(summary, description, s_date, e_date, user_email);
                        // add event to calendar
                        cal.action();

                        return true;
                    }
                });

            }

        })
}


const displaySuccessMessage = (user, msg) => {
    // send email with user requests to Joseph
    const params = {
        icon_emoji: ':information_source:'
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
                "authorization" : `Bearer ${process.env.USER_TOKEN}`
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

const cancelRequest = (user, msg) => {
    
    const params = {
        icon_emoji: ':information_source:'
    }

    axios.get(
        'https://slack.com/api/users.profile.get', 
        {
            headers: {
                "authorization" : `Bearer ${process.env.USER_TOKEN}`
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
                `You have cancelled your request. You can always initiate a request by sending me hi.`,
                params
            )
        })

}


module.exports = {getDataFromApi, handleMessages};