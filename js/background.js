/**
 * Created by ibrahim on 22.05.2017.
 */

var url = 'https://www.investingcurrencies.com?pairs=';
var notification_levels = {};

function notify(data, selected_currencies, notification_threshold) {
    var notify = false;
    var messages = [];

    for (let curr_id of selected_currencies) {
        if (!(curr_id in notification_levels)) {
            //initialize level to 0
            notification_levels[curr_id] = 0;
        }
        try {
            var cur_percentage = data[curr_id]["percentage"];
            var cur_name = data[curr_id]["name"];
            var cur_rate = data[curr_id]["rate"];
            if (!cur_rate || !cur_name || !cur_percentage) continue;

            if (Math.abs(cur_percentage - notification_levels[curr_id]) > notification_threshold) {
                notification_levels[curr_id] = cur_percentage;
                notify = true;
                messages.push(cur_name + " rate is " + cur_rate + " (%" + cur_percentage + ")");

            }
        }
        catch(err) {
            console.log(curr_id)
            console.log(err.message);
        }

    }

    if (notify === true) {
        var options = {
            type: 'basic',
            title: 'Currency Rates Changes',
            message: messages.join("\n"),
            iconUrl: '../css/images/icon.jpeg',
            requireInteraction: true
        };
        //console.log(messages);
        chrome.notifications.create(options);

    }

}

function check_rates() {
    chrome.storage.sync.get({
        selectedCurrencies: ["1", "2", "6"],
        selectedCryptoCurrencies: ["945629", "1058142", "1158819"],
        enableNotification: true,
        notificationThreshold: 0.5,
        notificationThresholdCrypto: 5
    }, function (items) {
        if (!items.enableNotification) {
            return;
        } else {
            chrome.storage.session.get({notification_levels: {}}, function (result) {
                notification_levels = result.notification_levels;
            });
            fetch(url + items.selectedCurrencies.concat(items.selectedCryptoCurrencies).join(","))
                .then(function (response) {
                    if (response.status !== 200) {
                        console.log('Looks like there was a problem. Status Code: ' + response.status);
                        return;
                    }
                    // The API call was successful!
                    let data = response.json();
                    data.then(function (result) {

                        notify(result, items.selectedCurrencies, items.notificationThreshold)
                        notify(result, items.selectedCryptoCurrencies, items.notificationThresholdCrypto)
                        chrome.storage.session.set({notification_levels: notification_levels}, function () {
                            console.log(notification_levels);
                        });
                    });
                }).catch(function (err) {
                // There was an error
                console.log('Something went wrong.', err);
            });
        }

    });
}

const periodInMinutes = 3;
chrome.runtime.onInstalled.addListener(details => {
    chrome.alarms.create("myAlarm", {periodInMinutes});
});
chrome.alarms.onAlarm.addListener((alarm) => {
    //check_rates();
    check_rates();
});

