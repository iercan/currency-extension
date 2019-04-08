// Saves options to chrome.storage
function save_options() {
  var curlist = [];
  $("li input[type=checkbox]").each(function(){
      if (this.checked){ 
          curlist.push(this.id);
      }
  });
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
//    document.getElementById('color').value = items.favoriteColor;
  //  document.getElementById('like').checked = items.likesColor;
  });
}

function filter_currency(){
    var search_val = $("#filter_currency").val().toUpperCase();
    var cur_val = "";
    
    $("ul li").each(function(){
        cur_val = $(this).attr("title");
        if (cur_val.includes(search_val)){
            $(this).show()
        }
        else{
            $(this).hide()
            
        }
    });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
document.getElementById('filter_currency').onkeyup=filter_currency;
