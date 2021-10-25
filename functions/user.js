exports.handler = function (context, event, callback) {
    var axios = require('axios');
    var config = {
        method: 'get',
        url: 'https://profiles.segment.com/v1/spaces/' + process.env.SEGMENT_SPACEID + '/collections/users/profiles/user_id:' + event.from + '/traits',
        headers: {
            'Authorization': 'Basic ' + process.env.SEGMENT_PERSONAS_PROFILE_KEY
        }
    };

    var result = {};

    axios(config)
        .then(function (response) {
            result = response.data;
            result.found = 1
            callback(null, result);
        })
        .catch(function (error) {

            result.found = 0;

            callback(null, result);
    });
}