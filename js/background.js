/**
 * Created by ibrahim on 22.05.2017.
 */

var notification_levels = {};
var url = 'https://www.investingcurrencies.com?pairs=';

chrome.storage.local.get({notification_levels: {}}, function(result) {
    notification_levels = result.notification_levels;
});

function notify(data, selected_currencies, notification_threshold) {
    var notify = false;
    var messages = [];

    for (let value of selected_currencies){
        if (!(value in notification_levels)) {
            //initialize level to 0
            notification_levels[value] = 0;
        }
        var cur_percentage = data[value]["percentage"];
        var cur_name = data[value]["name"];
        var cur_rate = data[value]["rate"];

        if (Math.abs(cur_percentage - notification_levels[value]) > notification_threshold) {
            //console.log("lev: " + level + " " + notification_levels[value]);
            notification_levels[value] = cur_percentage;
            notify = true;
            messages.push(cur_name + " rate is " + cur_rate + " (%" + cur_percentage + ")");

        }
    }
    chrome.storage.local.set({notification_levels: notification_levels}, function() {
        console.log(notification_levels);
    });
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
            fetch(url + items.selectedCurrencies.concat(items.selectedCryptoCurrencies).join(","))
                .then(function (response) {
                // The API call was successful!
                let data = response.json();
                data.then(function(result) {
                    notify(result, items.selectedCurrencies, items.notificationThreshold)
                    notify(result, items.selectedCryptoCurrencies, items.notificationThresholdCrypto)
                })
                }).catch(function (err) {
                // There was an error
                console.warn('Something went wrong.', err);
                });
        }

    });
}

const periodInMinutes  = 5;
chrome.runtime.onInstalled.addListener( details => {
    chrome.alarms.create( "myAlarm", { periodInMinutes } );
});
chrome.alarms.onAlarm.addListener( ( alarm ) => {
    //check_rates();
    check_rates();
});

