exports.handler = async function (context, event, callback) {
    var faker = require('faker');
    const analytics = require('analytics-node');

    const segment = new analytics(process.env.SEGMENT, { flushAt: 1 });
    var axios = require('axios');

    var result = { found: null, checkedIn: null };
    var userTraitsFound = await getUserTraits(event.phonenumber);
    if (!userTraitsFound) {
        // user first time check in
        userTraits = {
            name: faker.name.findName(),
            email: faker.internet.email(),
            phone: event.phonenumber,
            state: faker.address.state(),
            city: faker.address.city(),
            zip: faker.address.zipCode()
        }

        segment.identify({
            userId: event.phonenumber,
            traits: userTraits
        });
    }

    segment.track({
        userId: event.phonenumber,
        event: 'checked-in',
        properties: {
            site: event.checkin
        }
    });
    result = {
        userTraits: !userTraitsFound ? userTraits : userTraitsFound
        , found: !userTraitsFound ? false : true
        , checkedIn: true
    };

    callback(null, result);

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
}