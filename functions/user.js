exports.handler = function(context, event, callback) {

    var axios = require('axios');

    var config = {
    method: 'get',
    url: 'https://profiles.segment.com/v1/spaces/' + process.env.SEGMENT_SPACEID + '/collections/users/profiles/user_id:' + event.from + '/traits',
    headers: { 
        'Authorization': 'Basic ' + process.env.SEGMENT_PERSONAS_PROFILE_KEY
    }
    };

    axios(config)
    .then(function (response) {
        callback(null, response.data);
    })
    .catch(function (error) {
    console.log(error);
    });

}