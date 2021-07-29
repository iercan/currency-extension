
document.addEventListener('DOMContentLoaded', function(){



    setTimeout(function(){
        chrome.storage.sync.get({
            selectedCurrencies: ["1","2","6"],
            language: "www",
            selectedCryptoCurrencies: ["945629","1058142", "1158819"]
        }, function(items) {
            console.log(url);
            console.log(items);
            var url='https://'+items.language+'.widgets.investing.com/live-currency-cross-rates?theme=darkTheme&hideTitle=true&pairs=';
            $("#mainframe").attr("src", url + items.selectedCurrencies.join(","));

            var crypto_url='https://'+items.language+'.widgets.investing.com/crypto-currency-rates?theme=darkTheme&hideTitle=true&pairs=';
            $("#cryptoframe").attr("src", crypto_url + items.selectedCryptoCurrencies.join(","));

            var hg = String(items.selectedCurrencies.length * 58 + 60);
            $("#mainframe").attr("height", hg);

            hg = String(items.selectedCryptoCurrencies.length * 58 + 60);
            $("#cryptoframe").attr("height", hg);
        });
    },800);
    setTimeout(function(){
        $("#processing").hide();
    },1200);
});


