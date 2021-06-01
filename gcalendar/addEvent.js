const {google} = require('googleapis');

class Event {

    constructor(auth) {
        this.auth = auth;
        this.calendar = google.calendar({version: 'v3', auth});
    }

    addEvent(summary, description, start_date, end_date, email) {

        let event = {
            'summary': summary,
            'description': description,
            'start': {
                'dateTime': start_date,
                'timeZone': 'Africa/Accra',
            },
            'end': {
                'dateTime': end_date,
                'timeZone': 'Africa/Accra',
            },
            'reminders': {
                'useDefault': false,
                'overrides': [
                    {'method': 'email', 'minutes': 24 * 60},
                    {'method': 'popup', 'minutes': 15},
                ],
            },
        };

        // make request to google calendar API
        this.calendar.events.insert({
            auth: this.auth,
            // calendarId: 'primary',
            calendarId: email,
            resource: event,
        }, function(err, event) {
            if(err) {
                console.log('There was an error contacting the calendar service' + err);
                return;
            }
            console.log('Event Created: %s', event.htmlLink);
        });
    }
}

module.exports = Event;