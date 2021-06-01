const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

class Gcal {

    constructor(summary, description, start_date, end_date, email) {
        // this.auth = auth;
        this.summary = summary;
        this.description = description;
        this.start_date = start_date;
        this.end_date = end_date;
        this.email = email;
        this.SCOPES = ['https://www.googleapis.com/auth/calendar'];
        this.TOKEN_PATH = 'token.json';

        // console.log(summary);
    }

    action() {
        // If modifying these scopes, delete token.json.
        // const SCOPES = ['https://www.googleapis.com/auth/calendar'];
        // // The file token.json stores the user's access and refresh tokens, and is
        // // created automatically when the authorization flow completes for the first
        // // time.
        // const TOKEN_PATH = 'token.json';

        // Load client secrets from a local file.
        fs.readFile('credentials.json', (err, content) => {
        if (err) return console.log('Error loading client secret file:', err);
        // Authorize a client with credentials, then call the Google Calendar API.
        this.authorize(JSON.parse(content), this.addEvent);
        });
    }


    /**
     * Create an OAuth2 client with the given credentials, and then execute the
     * given callback function.
     * @param {Object} credentials The authorization client credentials.
     * @param {function} callback The callback to call with the authorized client.
     */
    authorize(credentials, callback) {
        const {client_secret, client_id, redirect_uris} = credentials.web;
        const oAuth2Client = new google.auth.OAuth2(
            client_id, client_secret, redirect_uris[0]);
      
        // Check if we have previously stored a token.
        fs.readFile(this.TOKEN_PATH, (err, token) => {
          if (err) return getAccessToken(oAuth2Client, callback);
          oAuth2Client.setCredentials(JSON.parse(token));
          callback(oAuth2Client, this.summary, this.description, this.start_date, this.end_date, this.email);
        });
    }

    
    /**
     * Get and store new token after prompting for user authorization, and then
     * execute the given callback with the authorized OAuth2 client.
     * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
     * @param {getEventsCallback} callback The callback for the authorized client.
     */
    getAccessToken(oAuth2Client, callback) {
        const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: this.SCOPES,
        });
        console.log('Authorize this app by visiting this url:', authUrl);
        const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        });
        rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error retrieving access token', err);
            oAuth2Client.setCredentials(token);
            // Store the token to disk for later program executions
            fs.writeFile(this.TOKEN_PATH, JSON.stringify(token), (err) => {
            if (err) return console.error(err);
            console.log('Token stored to', this.TOKEN_PATH);
            });
            callback(oAuth2Client);
        });
        });
    }

    
    addEvent(auth, summary, description, start_date, end_date, email) {
        // Refer to the Node.js quickstart on how to setup the environment:
        // https://developers.google.com/calendar/quickstart/node
        // Change the scope to 'https://www.googleapis.com/auth/calendar' and delete any
        // stored credentials.
        console.log(`summary:${summary}, desc:${description}, start_date:${start_date}, end_date:${end_date}, email:${email}`);
        // console.log(summary);
        const calendar = google.calendar({version: 'v3', auth});
        var event = {
        'summary': summary,
        'location': 'IC Asset Managers',
        'description': description,
        'start': {
            'dateTime': start_date,
            'timeZone': 'Africa/Accra',
        },
        'end': {
            'dateTime': end_date,
            'timeZone': 'Africa/Accra',
        },
        'recurrence': [
            'RRULE:FREQ=DAILY;COUNT=2'
        ],
        // 'attendees': [
        //   {'email': 'lpage@example.com'},
        //   {'email': 'sbrin@example.com'},
        // ],
        'reminders': {
            'useDefault': false,
            'overrides': [
            {'method': 'email', 'minutes': 24 * 60},
            {'method': 'popup', 'minutes': 10},
            ],
        },
        };
    
        calendar.events.insert({
        auth: auth,
        // calendarId: 'joseph.nyako@icassetmanagers.com',
        calendarId: 'johnson.obeng@icassetmanagers.com',
        // calendarId: 'primary',
        resource: event,
        }, function(err, event) {
        if (err) {
            console.log('There was an error contacting the Calendar service: ' + err);
            return;
        }
        console.log('Event created: %s', event.htmlLink);
        });
    
    }
}

module.exports = Gcal;