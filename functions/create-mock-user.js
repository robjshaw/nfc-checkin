exports.handler = function(context, event, callback) {

    const twilioClient = context.getTwilioClient();
    var faker = require('faker');
    const analytics = require('analytics-node');

    const segment = new analytics(process.env.SEGMENT, { flushAt: 1 });

    var axios = require('axios');
    var config = {
        method: 'get',
        url: 'https://profiles.segment.com/v1/spaces/' + process.env.SEGMENT_SPACEID + '/collections/users/profiles/user_id:' + event.phonenumber + '/traits',
        headers: {
            'Authorization': 'Basic ' + process.env.SEGMENT_PERSONAS_PROFILE_KEY
        }
    };

    var result = {};

    axios(config)
        .then(function (response) {
            // someone we know

            result = response.data;
            result.found = 1

            segment.track({
                userId: event.phonenumber,
                event: 'checked-in',
                properties: {
                    site : event.checkin
                }
            });

            callback(null, result);
        })
        .catch(function (error) {
            // new user!

            console.log(error);

            segment.identify({
                userId: event.phonenumber,
                traits: {
                    name : faker.name.findName(),
                    email : faker.internet.email(),
                    phone : event.phonenumber,
                    state : faker.address.state(),
                    city : faker.address.city(),
                    zip : faker.address.zipCode()
                }
            });

            segment.track({
                userId: event.phonenumber,
                event: 'checked-in',
                properties: {
                    site : event.checkin
                }
            });

            result.found = 0;

            callback(null, result);
    });
}