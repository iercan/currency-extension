/**
 * Created by ibrahim on 22.05.2017.
 */

/*
var options = {
    type: 'basic',
    title: 'Currency Changes',
    message: 'USD/TRY rate is 6. (%1.23)',
    iconUrl: 'css/images/icon.jpeg'
}
setTimeout(function(){
    chrome.notifications.create(options);
},2000);*/

chrome.tabs.create({
    url : 'https://www.investingwidgets.com/live-currency-cross-rates?roundedCorners=true&theme=darkTheme&hideTitle=true&pairs=1,2,6',
    active: false
    },
    function (){
        console.log("created");
}
)

var notification_levels = {};
var url = 'https://www.investingwidgets.com/live-currency-cross-rates?roundedCorners=true&theme=darkTheme&hideTitle=true&pairs=';
var crypto_url = 'https://www.investingwidgets.com/crypto-currency-rates?theme=darkTheme&hideTitle=true&pairs=';

stringToHTML = function (str) {
    var dom = document.createElement('div');
    dom.innerHTML = str;
    return dom;
};

function parse_widget(data, selected_currencies, notification_threshold) {
    var notify = false;
    var messages = [];
    var html = stringToHTML(data);

    for (let value of selected_currencies){
        if (!(value in notification_levels)) {
            //initialize level to 0
            notification_levels[value] = 0;
        }
        var cur_pertentage = parseFloat($(html).find(".pid-" + value + "-pcp").eq(0).text());
        //console.log("per:" + cur_pertentage);
        var cur_name = $(html).find("#pair_" + value + " .js-col-pair_name a").eq(0).text();
        //console.log("name:" + cur_name);
        var cur_rate = $(html).find(".pid-" + value + "-bid").eq(0).text();
        //console.log("rate:" + cur_rate);
        if (Math.abs(cur_pertentage - notification_levels[value]) > notification_threshold) {
            //console.log("lev: " + level + " " + notification_levels[value]);
            notification_levels[value] = cur_pertentage;
            notify = true;
            messages.push(cur_name + " rate is " + cur_rate + " (%" + cur_pertentage + ")");

        }
    }
    console.log(notification_levels);
    if (notify === true) {
        var options = {
            type: 'basic',
            title: 'Currency Rates Changes',
            message: messages.join("\n"),
            iconUrl: 'css/images/icon.jpeg',
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
            fetch(url + items.selectedCurrencies.join(","))
                .then(function (response) {
                // The API call was successful!
                return response.text();
                }).then(function (html_data) {
                // This is the HTML from our response as a text string
                console.log(html_data);
                parse_widget(html_data, items.selectedCurrencies, items.notificationThreshold)
                }).catch(function (err) {
                // There was an error
                console.warn('Something went wrong.', err);
                });
            /*$.get(url + items.selectedCurrencies.join(","), function (data) {
                parse_widget(data, items.selectedCurrencies, items.notificationThreshold)
            });
            $.get(crypto_url + items.selectedCryptoCurrencies.join(","), function (data) {
                parse_widget(data, items.selectedCryptoCurrencies, items.notificationThresholdCrypto)
            });*/

        }

    });
}

//check rates in every 2 min
setInterval(function () {
    check_rates();
}, 1000 * 60 * 2);

//chrome.browserAction.onClicked.addListener(function(tab) {
//   chrome.tabs.create({ url: "/main.html" });
//$("#mainframe").attr("height", "100px" );
//});
