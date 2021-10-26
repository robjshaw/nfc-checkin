exports.handler = function (context, event, callback) {
    var axios = require('axios');

    try {
        var options = {
            method: 'GET',
            url: `${process.env.SEGMENT_BASE_URL}/spaces/${process.env.SEGMENT_SPACEID}/collections/users/profiles/user_id:${userId}/events`,
            headers: {
                'Authorization': 'Basic ' + process.env.SEGMENT_PERSONAS_PROFILE_KEY
            }
        };

        const response = await axios.request(options);
        const result = response.data;
        callback(null, result);
    }
    catch (error) {
        if (error.response.status != '404') {
            console.log(error);
        }
        callback(null, 'no events found for user');
    }
}