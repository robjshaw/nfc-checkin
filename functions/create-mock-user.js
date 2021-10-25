exports.handler = function (context, event, callback) {

    const twilioClient = context.getTwilioClient();
    var faker = require('faker');
    const analytics = require('analytics-node');

    const segment = new analytics(process.env.SEGMENT, { flushAt: 1 });

    var axios = require('axios');
    const axiosInstance = axios.create({
        baseURL: 'https://profiles.segment.com/v1',
        headers: {
            'Authorization': 'Basic ' + process.env.SEGMENT_PERSONAS_PROFILE_KEY
        }
    });

    var result = {};
    var options = {
        method: 'GET',
        url: '/spaces/' + process.env.SEGMENT_SPACEID + '/collections/users/profiles/user_id:' + event.phonenumber + '/traits'
    };

    axiosInstance.request(options)
        .then(function (response) {
            // use already checked in before
            result = response.data;
            result.found = 1

            segment.track({
                userId: event.phonenumber,
                event: 'checked-in',
                properties: {
                    site: event.checkin
                }
            });

            callback(null, result);
        })
        .catch(function (error) {
            // user first time check in
            segment.identify({
                userId: event.phonenumber,
                traits: {
                    name: faker.name.findName(),
                    email: faker.internet.email(),
                    phone: event.phonenumber,
                    state: faker.address.state(),
                    city: faker.address.city(),
                    zip: faker.address.zipCode()
                }
            });

            segment.track({
                userId: event.phonenumber,
                event: 'checked-in',
                properties: {
                    site: event.checkin
                }
            });

            if (error.response.status != 404) {
                result.error = error;
            }
            callback(null, "user is created");
        });

}