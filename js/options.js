// Saves options to chrome.storage
function save_options() {
    var curlist = $("#currency_select").select2("val");
    var crypto_curlist = $("#crypto_currency_select").select2("val");
    var language = $("#language").select2("val");
    var active_tab = $("#active_tab").select2("val");
    var enable_not = $("#enable_notification").prop("checked");
    var threshold = parseFloat($("#notification_threshold").val());
    var threshold_crypto = parseFloat($("#notification_threshold_crypto").val());
    var status = $('#status');
    if (threshold > 100 || threshold <= 0 || !threshold) {
        status.text('Error: Threshold should be between 0 and 100.');
        return;
    }
    if (threshold_crypto > 100 || threshold_crypto <= 0 || !threshold) {
        status.text('Error: Threshold should be between 0 and 100.');
        return;
    }
    if(curlist.length > 15 || crypto_curlist.length > 15){
        status.text('Error: You can select maximum 15 currency.');
        return;
    }
    chrome.storage.sync.set({
        selectedCurrencies: curlist,
        selectedCryptoCurrencies: crypto_curlist,
        enableNotification: enable_not,
        notificationThreshold: threshold,
        notificationThresholdCrypto: threshold_crypto,
        language: language,
        active_tab: active_tab
    }, function () {
        // Update status to let user know options were saved.

        status.text('Options saved. Window will be closed.');
        ANL.fireEvent("option_save");
        setTimeout(function () {
            window.close();
        }, 2000);

    });

}
moveElementToEndOfParent = function(element) {
    let parent = element.parent();
    element.detach();
    parent.append(element);
};

sort_select_box = function (id, values) {
    values.forEach(function (v){
        let element = $("#"+id).children("option[value='"+v+"']");
        moveElementToEndOfParent(element);
    });

}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
    chrome.storage.sync.get({
        selectedCurrencies: ["1", "2", "6"],
        selectedCryptoCurrencies: ["945629", "1058142", "1158819"],
        enableNotification: true,
        notificationThreshold: 0.5,
        notificationThresholdCrypto: 5,
        language: "www",
        active_tab: "currency"
    }, function (items) {
        sort_select_box("currency_select", items.selectedCurrencies);
        $('#currency_select').val(items.selectedCurrencies).trigger('change');
        sort_select_box("crypto_currency_select", items.selectedCryptoCurrencies);
        $('#crypto_currency_select').val(items.selectedCryptoCurrencies).trigger('change');

        $('#language').val(items.language).trigger('change');
        $('#active_tab').val(items.active_tab).trigger('change');
        if (items.enableNotification) {
            $("#enable_notification").bootstrapToggle('on');
        } else {
            $("#enable_notification").bootstrapToggle('off');
        }
        $("#notification_threshold").val(items.notificationThreshold);
        $("#notification_threshold_crypto").val(items.notificationThresholdCrypto);
        let currency_select_elem = $('#currency_select');
        currency_select_elem.select2({
            placeholder: 'Select currencies',
            minimumInputLength: 3
        }).on("select2:select", function (evt) {
            let id = evt.params.data.id;
            console.log(id);
            let element = $(this).children("option[value="+id+"]");
            moveElementToEndOfParent(element);
            $(this).trigger("change");

        });
        let ele = currency_select_elem.parent().find("ul.select2-selection__rendered");
        ele.sortable({
            containment: 'parent',
            cursor: "grabbing",
            update: function() {
                currency_select_elem.parent().find("ul.select2-selection__rendered").children("li[title]").each(function(i, obj){
                    let element = currency_select_elem.children('option').filter(function () { return $(this).html() == obj.title });
                    moveElementToEndOfParent(element)
                });
                console.log(""+currency_select_elem.val())
            }
        });

        let crypto_currency_select_elem = $('#crypto_currency_select');
        crypto_currency_select_elem.select2({
            placeholder: 'Select crypto currencies',
            minimumInputLength: 3
        }).on("select2:select", function (evt) {
            let id = evt.params.data.id;
            console.log(id);
            let element = $(this).children("option[value="+id+"]");
            moveElementToEndOfParent(element);
            $(this).trigger("change");

        });
        let cele = crypto_currency_select_elem.parent().find("ul.select2-selection__rendered");
        cele.sortable({
            containment: 'parent',
            cursor: "grabbing",
            update: function() {
                crypto_currency_select_elem.parent().find("ul.select2-selection__rendered").children("li[title]").each(function(i, obj){
                    let element = crypto_currency_select_elem.children('option').filter(function () { return $(this).html() == obj.title });
                    moveElementToEndOfParent(element)
                });
                console.log(""+crypto_currency_select_elem.val())
            }
        });

        $('#language').select2({
                minimumResultsForSearch: -1
            }
        );

        $('#active_tab').select2({
                minimumResultsForSearch: -1
            }
        );
    });
}

document.addEventListener('DOMContentLoaded', function (){
    restore_options();
    chrome.storage.sync.get({
        rateUsClicked: false,
        pageViewCount: 0
    }, function (items) {
        document.getElementById("rate-us-text").hidden = items.rateUsClicked || items.pageViewCount % 5 !== 4;
    });
});
document.getElementById('save').addEventListener('click', save_options);
window.addEventListener("load", async () => {
    await ANL.firePageViewEvent(document.title, document.location.href);

});

document.getElementById('rate-us-link-options').addEventListener('click', function (){
    chrome.storage.sync.set({
        rateUsClicked: true
    });
    ANL.fireEvent("rate_us_clicked");
});



