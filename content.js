// Check if the current page has job application fields
window.onload = function() {
    const nameField = document.querySelector('input[name="name"], input[name="full_name"]');
    const emailField = document.querySelector('input[name="email"]');
    const phoneField = document.querySelector('input[name="phone"], input[type="tel"]');
    const addressField = document.querySelector('input[name="address"]');
  
    // Retrieve stored data from Chrome storage
    chrome.storage.local.get(['name', 'email', 'phone', 'address'], function(result) {
        const name = result.name || '';
        const email = result.email || '';
        const phone = result.phone || '';
        const address = result.address || '';

        // Fill in the fields automatically
        if (nameField) nameField.value = name;
        if (emailField) emailField.value = email;
        if (phoneField) phoneField.value = phone;
        if (addressField) addressField.value = address;
    });
};
