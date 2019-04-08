// Saves options to chrome.storage
function save_options() {
  var curlist = $(".currency_select").select2("val");
  chrome.storage.sync.set({
    selectedCurrencies: curlist
  }, function() {
    // Update status to let user know options were saved.
    var status = $('#status');
    status.text('Options saved.');
    setTimeout(function() {
      status.text('');
    }, 5000);
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  // Use default value color = 'red' and likesColor = true.
  chrome.storage.sync.get({
    selectedCurrencies: ["1","2","6"]
  }, function(items) {
      $('.currency_select').val(items.selectedCurrencies);
      $('.currency_select').trigger('change');
  });
}
$('.currency_select').select2();

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);



