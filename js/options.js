// Saves options to chrome.storage
function save_options() {
  var curlist = $("#currency_select").select2("val");
  var crypto_curlist = $("#crypto_currency_select").select2("val");
  var language = $("#language").select2("val");
  var enable_not =  $("#enable_notification").prop("checked");
  var threshold =  parseFloat($("#notification_threshold").val());
  var status = $('#status');
  if (threshold > 10 || threshold <= 0 || !threshold){
    status.text('Error: Threshold should be between 0 and 10.');
    return;
  }
  chrome.storage.sync.set({
    selectedCurrencies: curlist,
    selectedCryptoCurrencies: crypto_curlist,
    enableNotification: enable_not,
    notificationThreshold: threshold,
    language: language
  }, function() {
    // Update status to let user know options were saved.

    status.text('Options saved. Window will be closed.');
    setTimeout(function() {
      window.close();
    }, 4000);

  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  chrome.storage.sync.get({
    selectedCurrencies: ["1","2","6"],
    selectedCryptoCurrencies: ["945629","1058142", "1158819"],
    enableNotification: true,
    notificationThreshold: 0.5,
    language: "www"
  }, function(items) {
      $('#currency_select').val(items.selectedCurrencies);
      $('#crypto_currency_select').val(items.selectedCryptoCurrencies);
      $('#currency_select').trigger('change');
      $('#crypto_currency_select').trigger('change');
      $('#language').val(items.language);
      $('#language').trigger('change');
      if (items.enableNotification){
        $("#enable_notification").bootstrapToggle('on');
      }
      else{
        $("#enable_notification").bootstrapToggle('off');
      }
      $("#notification_threshold").val(items.notificationThreshold);
  });
}
$('#currency_select').select2();
$('#crypto_currency_select').select2();
$('#language').select2({
        minimumResultsForSearch: -1
    }
);

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);



