document.getElementById('saveData').addEventListener('click', () => {
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const address = document.getElementById('address').value;

    // Save data to Chrome storage
    chrome.storage.local.set({
        name: name,
        email: email,
        phone: phone,
        address: address
    }, function() {
        alert('Data saved!');
    });
});
