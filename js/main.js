document.addEventListener('DOMContentLoaded', function () {

    chrome.storage.sync.get({
        selectedCurrencies: ["1", "2", "6"],
        language: "www",
        selectedCryptoCurrencies: ["945629", "1058142", "1158819"],
        active_tab: "currency"
    }, function (items) {
        //console.log(items);
        let tab = $("#" + items.active_tab + "-tab");
        tab.attr("aria-selected", "true");
        tab.addClass("active");
        let tab_content = $("#" + items.active_tab);
        tab_content.addClass("show");
        tab_content.addClass("active");

        let mainframe = $("#mainframe");
        if (items.selectedCurrencies.length > 0) {
            let url = 'https://' + items.language + '.investingwidgets.com/live-currency-cross-rates?roundedCorners=true&theme=darkTheme&hideTitle=true&pairs=';
            mainframe.attr("src", url + items.selectedCurrencies.join(","));
        }

        let cryptoframe = $("#cryptoframe");
        if (items.selectedCryptoCurrencies.length > 0) {
            let crypto_url = 'https://' + items.language + '.investingwidgets.com/crypto-currency-rates?roundedCorners=true&theme=darkTheme&hideTitle=true&pairs=';
            cryptoframe.attr("src", crypto_url + items.selectedCryptoCurrencies.join(","));
        }

        let hg = String(items.selectedCurrencies.length * 58 + 60);
        mainframe.attr("height", hg);

        hg = String(items.selectedCryptoCurrencies.length * 58 + 60);
        cryptoframe.attr("height", hg);
    });

});


