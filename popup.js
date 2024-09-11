document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed.");

    const applyButton = document.getElementById('applySelected');
    const deleteButton = document.getElementById('deleteSelected');
    const addCustomFieldButton = document.getElementById('addCustomField');
    const customFieldContainer = document.getElementById('customFieldContainer');

    // Load saved data from Chrome storage when the extension is opened
    chrome.storage.local.get(['selectedFields', 'customFields'], function(result) {
        const selectedFields = result.selectedFields || {};
        const customFields = result.customFields || [];

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

        // Populate saved custom fields
        customFields.forEach((customField, index) => {
            addCustomFieldToDOM(customField.label, customField.value, index);
        });
    });

    // Save data function (auto-saves when input is modified)
    function saveData() {
        const selectedFields = {};
        const customFields = [];

        const nameField = document.getElementById('name');
        const emailField = document.getElementById('email');
        const phoneField = document.getElementById('phone');
        const addressField = document.getElementById('address');

        if (nameField) selectedFields['name'] = nameField.value;
        if (emailField) selectedFields['email'] = emailField.value;
        if (phoneField) selectedFields['phone'] = phoneField.value;
        if (addressField) selectedFields['address'] = addressField.value;

        // Collect custom fields' data
        document.querySelectorAll('.customField').forEach((field, index) => {
            const label = field.querySelector('.customFieldLabel').value;
            const value = field.querySelector('.customFieldValue').value;
            customFields.push({ label, value });
        });

        // Save the fields to local storage
        chrome.storage.local.set({ selectedFields: selectedFields, customFields: customFields }, function() {
            console.log("Fields saved successfully.", selectedFields, customFields);
        });
    }

    // Add custom field to DOM
    function addCustomFieldToDOM(label = '', value = '', index = null) {
        const customFieldDiv = document.createElement('div');
        customFieldDiv.classList.add('customField');
        customFieldDiv.innerHTML = `
            <input type="text" class="customFieldLabel" placeholder="Field Label" value="${label}">
            <input type="text" class="customFieldValue" placeholder="Field Value" value="${value}">
        `;
        customFieldContainer.appendChild(customFieldDiv);

        // Add auto-save listeners to new custom fields
        customFieldDiv.querySelector('.customFieldLabel').addEventListener('input', saveData);
        customFieldDiv.querySelector('.customFieldValue').addEventListener('input', saveData);
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
                'first_name': ['input[name="first_name"]', 'input[name="legal_first_name"]', 'input[autocomplete="given-name"]'],
                'last_name': ['input[name="last_name"]', 'input[name="legal_last_name"]', 'input[autocomplete="family-name"]'],
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

        // Autofill the fields
        const nameField = detectFormField('name');
        const emailField = detectFormField('email');
        const phoneField = detectFormField('phone');
        const addressField = detectFormField('address');

        if (nameField) {
            nameField.value = selectedFields['name'] || '';
        }
        if (emailField) {
            emailField.value = selectedFields['email'] || '';
        }
        if (phoneField) {
            phoneField.value = selectedFields['phone'] || '';
        }
        if (addressField) {
            addressField.value = selectedFields['address'] || '';
        }
    }

    // Delete all saved data when clicking the delete button
    deleteButton.addEventListener('click', () => {
        chrome.storage.local.remove(['selectedFields', 'customFields'], function() {
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

    // Add new custom field button logic
    addCustomFieldButton.addEventListener('click', () => {
        addCustomFieldToDOM(); // Add a new empty custom field
    });
});
