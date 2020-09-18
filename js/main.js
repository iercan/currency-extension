
document.addEventListener('DOMContentLoaded', function(){



    setTimeout(function(){
        chrome.storage.sync.get({
            selectedCurrencies: ["1","2","6"],
            language: "www"
        }, function(items) {
            console.log(url);
            console.log(items);
            var url='https://'+items.language+'.widgets.investing.com/live-currency-cross-rates?roundedCorners=true&theme=darkTheme&hideTitle=true&pairs=';
            $("#mainframe").attr("src", url + items.selectedCurrencies.join(","));
            var hg = String(items.selectedCurrencies.length * 58 + 60);
            $("#mainframe").attr("height", hg);
        });
    },800);
    setTimeout(function(){
        $("#processing").hide();
    },1200);
});


