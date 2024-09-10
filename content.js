// Check if the current page has job application fields
window.onload = function() {
    // Detect first name, middle name, last name, full name fields
    const firstNameField = document.querySelector('input[name="first_name"], input[name="given_name"], input[name="fname"]');
    const middleNameField = document.querySelector('input[name="middle_name"], input[name="middle_initial"], input[name="mname"], input[name="m_initial"]');
    const lastNameField = document.querySelector('input[name="last_name"], input[name="surname"], input[name="lname"]');
    const fullNameField = document.querySelector('input[name="name"], input[name="full_name"]');
    const emailField = document.querySelector('input[name="email"]');
    const phoneField = document.querySelector('input[name="phone"], input[type="tel"]');
    const addressField = document.querySelector('input[name="address"]');

    // Retrieve stored data from Chrome storage
    chrome.storage.local.get(['name', 'email', 'phone', 'address'], function(result) {
        const fullName = result.name || '';
        const nameParts = fullName.trim().split(' '); // Split full name by space

        const firstName = nameParts[0] || ''; // First name is the first word
        const middleName = nameParts.length > 2 ? nameParts[1] : ''; // Middle name is the second word, if available
        const lastName = nameParts.length > 1 ? nameParts.slice(-1)[0] : ''; // Last name is the last word or words

        // Fill in the appropriate fields
        if (firstNameField) firstNameField.value = firstName;
        if (middleNameField) middleNameField.value = middleName; // Fill middle name or initial if the field exists
        if (lastNameField) lastNameField.value = lastName;
        if (fullNameField) fullNameField.value = fullName; // Fill full name if only one name field exists
        if (emailField) emailField.value = result.email || '';
        if (phoneField) phoneField.value = result.phone || '';
        if (addressField) addressField.value = result.address || '';
    });
};
