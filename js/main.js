document.addEventListener('DOMContentLoaded', function () {


    setTimeout(function () {
        chrome.storage.sync.get({
            selectedCurrencies: ["1", "2", "6"],
            language: "www",
            selectedCryptoCurrencies: ["945629", "1058142", "1158819"],
            active_tab: "currency"
        }, function (items) {
            console.log(url);
            console.log(items);
            var tab = $("#"+items.active_tab+"-tab");
            tab.attr("aria-selected", "true");
            tab.addClass("active");
            var tab_content = $("#"+items.active_tab);
            tab_content.addClass("show");
            tab_content.addClass("active");

            if(items.selectedCurrencies.length > 0){
                var url = 'https://' + items.language + '.investingwidgets.com/live-currency-cross-rates?roundedCorners=true&theme=darkTheme&hideTitle=true&pairs=';
                $("#mainframe").attr("src", url + items.selectedCurrencies.join(","));
            }
            if (items.selectedCryptoCurrencies.length > 0){
                var crypto_url = 'https://' + items.language + '.investingwidgets.com/crypto-currency-rates?roundedCorners=true&theme=darkTheme&hideTitle=true&pairs=';
                $("#cryptoframe").attr("src", crypto_url + items.selectedCryptoCurrencies.join(","));
            }

            var hg = String(items.selectedCurrencies.length * 58 + 60);
            $("#mainframe").attr("height", hg);

            hg = String(items.selectedCryptoCurrencies.length * 58 + 60);
            $("#cryptoframe").attr("height", hg);



        });
    }, 800);
    setTimeout(function () {
        $(".processing").hide();
    }, 1200);
});


