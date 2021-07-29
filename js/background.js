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
var notification_levels = {};
var url = 'https://www.widgets.investing.com/live-currency-cross-rates?roundedCorners=true&theme=darkTheme&hideTitle=true&pairs=';
var crypto_url='https://www.widgets.investing.com/crypto-currency-rates?theme=darkTheme&hideTitle=true&pairs=';

function parse_widget(data, selected_currencies, notification_threshold){
    var notify = false;
    var messages = [];
    var html = $.parseHTML(data);
    $.each(selected_currencies, function (index, value) {
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
    });
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
        selectedCryptoCurrencies: ["945629","1058142", "1158819"],
        enableNotification: true,
        notificationThreshold: 0.5
    }, function (items) {
        if (!items.enableNotification) {
            return;
        } else {

            $.get(url + items.selectedCurrencies.join(","), function(data){
                parse_widget(data, items.selectedCurrencies, items.notificationThreshold)
            });
            $.get(crypto_url + items.selectedCryptoCurrencies.join(","), function(data){
                parse_widget(data, items.selectedCryptoCurrencies, items.notificationThreshold)
            });

        }

    });
}

//check rates in every 5 min
setInterval(function () {
    check_rates();
}, 1000 * 30);

//chrome.browserAction.onClicked.addListener(function(tab) {
//   chrome.tabs.create({ url: "/main.html" });
//$("#mainframe").attr("height", "100px" );
//});
