document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed.");

    const applyButton = document.getElementById('applySelected');
    const deleteButton = document.getElementById('deleteSelected');

    // Load saved data from Chrome storage when the extension is opened
    chrome.storage.local.get(['selectedFields'], function(result) {
        const selectedFields = result.selectedFields || {};

        // Populate stored data into the form inputs
        const nameField = document.getElementById('name');
        const emailField = document.getElementById('email');
        const phoneField = document.getElementById('phone');

        if (nameField && selectedFields['name']) {
            nameField.value = selectedFields['name'];
        }
        if (emailField && selectedFields['email']) {
            emailField.value = selectedFields['email'];
        }
        if (phoneField && selectedFields['phone']) {
            phoneField.value = selectedFields['phone'];
        }
    });

    // Save data function (auto-saves when input is modified)
    function saveData() {
        const selectedFields = {};

        // Collect values from multiple fields (name, email, etc.)
        const nameField = document.getElementById('name');
        const emailField = document.getElementById('email');
        const phoneField = document.getElementById('phone');

        if (nameField) selectedFields['name'] = nameField.value;
        if (emailField) selectedFields['email'] = emailField.value;
        if (phoneField) selectedFields['phone'] = phoneField.value;

        // Save the fields to local storage
        chrome.storage.local.set({
            selectedFields: selectedFields
        }, function() {
            console.log("Fields saved successfully.", selectedFields);
        });
    }

    // Injected content script to detect form fields and autofill
    function injectedAutofillScript(selectedFields) {
        // Detect form fields based on partial ID, name, or class matching
        function detectFormField(fieldName) {
            const fieldSelectors = {
                'name': ['input[name="name"]', 'input[id^="jv-field"]', 'input[autocomplete="name"]'],
                'email': ['input[name="email"]', 'input[autocomplete="email"]'],
                'phone': ['input[name="phone"]', 'input[autocomplete="tel"]']
            };

            const selectors = fieldSelectors[fieldName] || [];
            let field = null;
            selectors.some(selector => {
                field = document.querySelector(selector);
                return !!field;
            });

            if (field) {
                console.log(`Detected ${fieldName} field:`, field);
                return field;
            } else {
                console.warn(`No ${fieldName} field detected.`);
                return null;
            }
        }

        // Autofill the detected fields
        const nameField = detectFormField('name');
        const emailField = detectFormField('email');
        const phoneField = detectFormField('phone');

        if (nameField) {
            nameField.value = selectedFields['name'] || '';
            console.log(`Autofilled name field with: ${selectedFields['name']}`);
        }
        if (emailField) {
            emailField.value = selectedFields['email'] || '';
            console.log(`Autofilled email field with: ${selectedFields['email']}`);
        }
        if (phoneField) {
            phoneField.value = selectedFields['phone'] || '';
            console.log(`Autofilled phone field with: ${selectedFields['phone']}`);
        }
    }

    // Apply button logic
    if (applyButton) {
        applyButton.addEventListener('click', () => {
            console.log("Apply button clicked.");
            chrome.storage.local.get(['selectedFields'], function(result) {
                const selectedFields = result.selectedFields || {};

                // Inject the autofill script into the active tab
                chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                    chrome.scripting.executeScript({
                        target: { tabId: tabs[0].id },
                        function: injectedAutofillScript, // Inject the function
                        args: [selectedFields] // Pass saved data as an argument
                    });
                });
            });
        });
    }

    // Save the fields when they are modified
    function addAutoSaveListener(field) {
        if (field) {
            field.addEventListener('input', () => {
                console.log(`${field.id} field modified, saving...`);
                saveData();
            });
        }
    }

    const nameField = document.getElementById('name');
    const emailField = document.getElementById('email');
    const phoneField = document.getElementById('phone');

    // Attach auto-save listener to each field
    addAutoSaveListener(nameField);
    addAutoSaveListener(emailField);
    addAutoSaveListener(phoneField);

    // Delete functionality (only deletes checked fields)
    deleteButton.addEventListener('click', () => {
        const checkboxes = document.querySelectorAll('.delete-checkbox:checked');
        const fieldsToDelete = [];

        checkboxes.forEach(checkbox => {
            const field = checkbox.dataset.field;
            fieldsToDelete.push(field);
            document.getElementById(field).value = ''; // Clear the field in the UI
        });

        // Remove the selected fields from Chrome storage
        chrome.storage.local.get(['selectedFields'], function(result) {
            const selectedFields = result.selectedFields || {};
            fieldsToDelete.forEach(field => {
                delete selectedFields[field];
            });

            chrome.storage.local.set({
                selectedFields: selectedFields
            }, function() {
                console.log("Selected fields deleted.");
            });
        });
    });

    // Dynamically create checkboxes for each field
    function createCheckbox(fieldId) {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.classList.add('delete-checkbox');
        checkbox.dataset.field = fieldId;
        return checkbox;
    }

    // Add checkboxes for delete functionality next to each field
    const nameCheckbox = createCheckbox('name');
    const emailCheckbox = createCheckbox('email');
    const phoneCheckbox = createCheckbox('phone');

    document.querySelector('#name').parentElement.appendChild(nameCheckbox);
    document.querySelector('#email').parentElement.appendChild(emailCheckbox);
    document.querySelector('#phone').parentElement.appendChild(phoneCheckbox);
});
