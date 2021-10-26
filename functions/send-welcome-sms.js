let jsonSites = require('../assets/sites.json');
exports.handler = async function (context, event, callback) {
    const client = context.getTwilioClient();
    const axios = require('axios');
    
    const userTraitsFound = await getUserTraits(event.userId);
    const userEventsFound = await getUserEvents(event.userId);

    const siteDetails = jsonSites.filter((s) => s.id == userEventsFound.properties.site);
    const messageToSend = event.event == 'checked-in-first-time-enter'
        ? `Welcome to ${siteDetails[0].name}`
        : `Welcome back to ${siteDetails[0].name}`;

    const toPhoneNumber = event.userId;
    const messageRequest = client.messages
        .create({
            from: context.TWILIO_PHONE_NUMBER,
            to: toPhoneNumber,
            body: messageToSend,
        })
        .then((msg) => {
            return { success: true, sid: msg.sid, status: msg.status };
        })
        .catch((err) => {
            return { success: false, error: err.message };
        });

    messageRequest
        .then((result) => {
            return callback(null, { result });
        })
        .catch((err) => {
            console.error(err);
            return callback('Failed to send message');
        });

    async function getUserTraits(userId) {
        try {
            var options = {
                method: 'GET',
                url: `${process.env.SEGMENT_BASE_URL}/spaces/${process.env.SEGMENT_SPACEID}/collections/users/profiles/user_id:${userId}/traits`,
                headers: {
                    'Authorization': 'Basic ' + process.env.SEGMENT_PERSONAS_PROFILE_KEY
                }
            };

            const response = await axios.request(options);
            return response.data.traits;
        }
        catch (error) {
            if (error.response.status != '404') {
                console.log(error);
            }
            return null;
        }
    }

    async function getUserEvents(userId) {
        try {
            var options = {
                method: 'GET',
                url: `${process.env.SEGMENT_BASE_URL}/spaces/${process.env.SEGMENT_SPACEID}/collections/users/profiles/user_id:${userId}/events`,
                headers: {
                    'Authorization': 'Basic ' + process.env.SEGMENT_PERSONAS_PROFILE_KEY
                }
            };

            const response = await axios.request(options);
            return response.data.data.filter((e)=>e.event == 'checked-in')[0];
        }
        catch (error) {
            if (error.response.status != '404') {
                console.log(error);
            }
            return null;
        }
    }
}