document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed.");

    const applyButton = document.getElementById('applySelected');
    const deleteButton = document.getElementById('deleteSelected');
    const addCustomFieldButton = document.getElementById('addCustomField');
    const customFieldContainer = document.getElementById('customFieldContainer');

    // Load saved data from Chrome storage when the extension is opened
    chrome.storage.local.get(['selectedFields'], function(result) {
        const selectedFields = result.selectedFields || {};

        // Populate stored data into the form inputs
        const nameField = document.getElementById('name');
        const emailField = document.getElementById('email');
        const phoneField = document.getElementById('phone');
        const addressField = document.getElementById('address');

        if (nameField && selectedFields['name']) {
            nameField.value = selectedFields['name'];
        }
        if (emailField && selectedFields['email']) {
            emailField.value = selectedFields['email'];
        }
        if (phoneField && selectedFields['phone']) {
            phoneField.value = selectedFields['phone'];
        }
        if (addressField && selectedFields['address']) {
            addressField.value = selectedFields['address'];
        }
    });

    // Save data function (auto-saves when input is modified)
    function saveData() {
        const selectedFields = {};

        const nameField = document.getElementById('name');
        const emailField = document.getElementById('email');
        const phoneField = document.getElementById('phone');
        const addressField = document.getElementById('address');

        if (nameField) selectedFields['name'] = nameField.value;
        if (emailField) selectedFields['email'] = emailField.value;
        if (phoneField) selectedFields['phone'] = phoneField.value;
        if (addressField) selectedFields['address'] = addressField.value;

        // Save the fields to local storage
        chrome.storage.local.set({ selectedFields: selectedFields }, function() {
            console.log("Fields saved successfully.", selectedFields);
        });
    }

    // Apply button logic: Autofill saved data
    applyButton.addEventListener('click', () => {
        chrome.storage.local.get(['selectedFields'], function(result) {
            const selectedFields = result.selectedFields || {};
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                chrome.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    function: autofillForm, // Inject autofill function
                    args: [selectedFields] // Pass saved data as an argument
                });
            });
        });
    });

    // Autofill function to be injected into the active tab
    function autofillForm(selectedFields) {
        function detectFormField(fieldName) {
            const fieldSelectors = {
                'name': ['input[name="name"]', 'input[autocomplete="name"]'],
                'first_name': ['input[name="first_name"]', 'input[name="legal_first_name"]', 'input[autocomplete="given-name"]', 'input[name*="legal first"]'],
                'last_name': ['input[name="last_name"]', 'input[name="legal_last_name"]', 'input[autocomplete="family-name"]', 'input[name*="legal last"]'],
                'email': ['input[name="email"]', 'input[autocomplete="email"]'],
                'phone': ['input[name="phone"]', 'input[autocomplete="tel"]'],
                'address': ['input[name="address"]', 'input[autocomplete="street-address"]']
            };

            const selectors = fieldSelectors[fieldName] || [];
            let field = null;
            selectors.some(selector => {
                field = document.querySelector(selector);
                return !!field;
            });

            return field;
        }

        // Split full name into first, middle (or initial), and last
        const fullName = selectedFields['name'] || '';
        const nameParts = fullName.split(' ').filter(Boolean);
        const firstName = nameParts[0] || '';
        const middleName = nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : ''; // Middle name/initial if available
        const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';

        // Autofill the fields
        const nameField = detectFormField('name');
        const firstNameField = detectFormField('first_name');
        const lastNameField = detectFormField('last_name');
        const emailField = detectFormField('email');
        const phoneField = detectFormField('phone');
        const addressField = detectFormField('address');

        if (nameField) {
            nameField.value = fullName;
            console.log(`Autofilled name field with: ${fullName}`);
        }
        if (firstNameField) {
            firstNameField.value = firstName;
            console.log(`Autofilled first name field with: ${firstName}`);
        }
        if (lastNameField) {
            lastNameField.value = lastName;
            console.log(`Autofilled last name field with: ${lastName}`);
        }
        if (emailField) {
            emailField.value = selectedFields['email'] || '';
            console.log(`Autofilled email field with: ${selectedFields['email']}`);
        }
        if (phoneField) {
            phoneField.value = selectedFields['phone'] || '';
            console.log(`Autofilled phone field with: ${selectedFields['phone']}`);
        }
        if (addressField) {
            addressField.value = selectedFields['address'] || '';
            console.log(`Autofilled address field with: ${selectedFields['address']}`);
        }
    }

    // Delete all saved data when clicking the delete button
    deleteButton.addEventListener('click', () => {
        chrome.storage.local.remove(['selectedFields'], function() {
            console.log("All saved fields deleted.");
            document.getElementById('name').value = '';
            document.getElementById('email').value = '';
            document.getElementById('phone').value = '';
            document.getElementById('address').value = '';
            customFieldContainer.innerHTML = ''; // Clear custom fields
        });
    });

    // Auto-save fields when modified
    const fields = ['name', 'email', 'phone', 'address'];
    fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('input', saveData);
        }
    });

    // Add custom field button logic
    addCustomFieldButton.addEventListener('click', () => {
        const customDiv = document.createElement('div');
        customDiv.classList.add('customField', 'field-container');
        customDiv.innerHTML = `
            <input type="text" class="customFieldLabel" placeholder="Field Label">
            <input type="text" class="customFieldValue" placeholder="Field Value">
        `;
        customFieldContainer.appendChild(customDiv);
    });
});
