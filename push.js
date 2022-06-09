const fetch = require('node-fetch');
const { json } = require('express');

async function sendPushNotification(obj) {
    let { pushToken, pushTitle, pushBody, pushCmpny } = obj;
    let pushResult;

    const message = {
        to: pushToken,
        sound: 'default',
        title: pushTitle,
        body: pushBody,
        data: {
            result: 'success',
            cmpny: pushCmpny,
        },
        _displayInForeground: true,
    };

    const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Accept-encoding': 'gzip, deflate',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
    })
        .then((response) => response.json())
        .then((response) => {
            //response = JSON.stringify(response);
            console.log(response);

            if (response['data']['status'] == 'ok') {
                pushResult = 'success';
            } else {
                pushResult = 'fail';
            }
        });
    return pushResult;
}

module.exports = {
    sendPushNotification,
};
