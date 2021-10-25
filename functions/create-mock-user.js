exports.handler = function(context, event, callback) {

    const twilioClient = context.getTwilioClient();
    var faker = require('faker');
    const analytics = require('analytics-node');

    const segment = new analytics(process.env.SEGMENT, { flushAt: 1 });

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

    callback(null, 'done');
}