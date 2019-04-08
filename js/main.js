var url='https://www.widgets.investing.com/live-currency-cross-rates?roundedCorners=true&theme=darkTheme&hideTitle=true&pairs=';

chrome.storage.sync.get({
    selectedCurrencies: ["1","2","6"]
}, function(items) {
    $("#mainframe").attr("src", url + items.selectedCurrencies.join(","))
    var hg = String(items.selectedCurrencies.length * 58 + 60);
    $("#mainframe").attr("height", hg);
});

