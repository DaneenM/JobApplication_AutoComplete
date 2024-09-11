document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed.");

    const applyButton = document.getElementById('applySelected');

    // Save data function (now handles multiple fields)
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
            console.log("Fields saved successfully.");
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
    const nameField = document.getElementById('name');
    const emailField = document.getElementById('email');
    const phoneField = document.getElementById('phone');

    if (nameField) nameField.addEventListener('input', saveData);
    if (emailField) emailField.addEventListener('input', saveData);
    if (phoneField) phoneField.addEventListener('input', saveData);
});