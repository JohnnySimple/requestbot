const SlackBot = require('slackbots');
const axios = require('axios');
const dotenv = require('dotenv');

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

bot.on('start', () => {
    const params = {
        icon_emoji: ':robot_face:'
    }

    axios.get(
        'https://slack.com/api/users.list', 
        {
            headers: {
                "authorization" : "Bearer xoxp-1648733474034-1645646696901-1653996116135-a877ba5cc21270d241edd66c3f4bf9b8"
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
            // bot.postMessageToChannel(
            //     `random`,
            //     "Hello @random! You can call me @requestsBot. As my name goes, you can make all your requests through me.\
            //     \nFeel free to dm me.",
            //     params
            // )
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

    handleMessage(data.user, data.text);
});


// Handle message
handleMessage = (user, msg) => {

    if(msg.includes(' hi') || msg.includes(' hello') || msg.includes(' hey')) {
        const params = {
            icon_emoji: ':smiley:'
        }

        axios.get(
            'https://slack.com/api/users.profile.get', 
            {
                headers: {
                    "authorization" : "Bearer xoxp-1648733474034-1645646696901-1653996116135-a877ba5cc21270d241edd66c3f4bf9b8"
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
    
        // bot.postMessageToUser(
        //     'obengboatengjohnson',
        //     // "How can I help you today? Please select from the list below by number\
        //     // \n1.Request Office Chair\n2.Request Office Table\n3.Book conference room\
        //     // \n4.Request a Laptop\n5.Request a Turbo Net\n6.Request a Monitor\
        //     // \nPlease separate multiple selections with a comma.",
        //     "something here",
        //     params
        // )
    // }else if((msg.includes(' 1') || msg.includes(' 2') || msg.includes(' 3') || msg.includes(' 4') ||
    //         msg.includes(' 5') || msg.includes(' 6')) && step == "1") {

    }else if(msg.includes(' 1') && step == '1') {

            const params = {
                icon_emoji: ':smiley:'
            }
            
            axios.get(
                'https://slack.com/api/users.profile.get', 
                {
                    headers: {
                        "authorization" : "Bearer xoxp-1648733474034-1645646696901-1653996116135-a877ba5cc21270d241edd66c3f4bf9b8"
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
                        `${user_name}`,
                        "You want to request for an Office Chair. Please reply 'yes' to confirm",
                        params
                    )
                    
                });
            
            
            console.log(`step: ${step}`);
            // console.log(`username: ${user_name}`);


        }
    
}