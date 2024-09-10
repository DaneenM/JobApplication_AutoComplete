document.addEventListener('DOMContentLoaded', () => {
    const addCustomFieldButton = document.getElementById('addCustomField');
    const customFieldContainer = document.getElementById('customFieldContainer');

    // Load saved data from Chrome storage when the extension is opened
    chrome.storage.local.get(['selectedFields', 'customFields'], function(result) {
        const selectedFields = result.selectedFields || {};
        const customFields = result.customFields || {};

        // Populate stored data into the form inputs
        for (const field in selectedFields) {
            const input = document.getElementById(field);
            if (input) {
                input.value = selectedFields[field];
            }
        }

        // Populate custom fields
        customFields.forEach(customField => {
            const customDiv = document.createElement('div');
            customDiv.classList.add('customField', 'field-container');
            customDiv.innerHTML = `
                <input type="checkbox" class="customFieldCheckbox">
                <input type="text" class="customFieldLabel" value="${customField.label}" placeholder="Field Label">
                <input type="text" class="customFieldValue" value="${customField.value}" placeholder="Field Value">
            `;
            customFieldContainer.appendChild(customDiv);
        });
    });

    // Automatically save field data when it is modified
    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', () => {
            saveData();
        });
    });

    // Auto-save custom fields as soon as they are modified
    customFieldContainer.addEventListener('input', () => {
        saveData();
    });

    // Apply only the selected fields
    document.getElementById('applySelected').addEventListener('click', () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                function: autofillForm
            });
        });
    });

    // Delete only the selected fields
    document.getElementById('deleteSelected').addEventListener('click', () => {
        const fieldsToDelete = [];

        // Collect all selected fields and custom fields to be deleted
        document.querySelectorAll('.field-checkbox:checked').forEach(checkbox => {
            const field = checkbox.dataset.field;
            fieldsToDelete.push(field);
            document.getElementById(field).closest('.field-container').remove(); // Remove from UI
        });

        document.querySelectorAll('.customFieldCheckbox:checked').forEach(checkbox => {
            checkbox.closest('.customField').remove(); // Remove custom field from UI
        });

        // Remove from Chrome storage
        chrome.storage.local.get(['selectedFields', 'customFields'], function(result) {
            const selectedFields = result.selectedFields || {};
            const customFields = result.customFields || [];

            // Remove selected standard fields
            fieldsToDelete.forEach(field => {
                delete selectedFields[field];
            });

            // Remove checked custom fields
            const updatedCustomFields = customFields.filter(field => {
                const fieldLabel = field.label;
                const isChecked = document.querySelector(`input[value="${fieldLabel}"]`).checked;
                return !isChecked;
            });

            // Save the updated data
            chrome.storage.local.set({
                selectedFields: selectedFields,
                customFields: updatedCustomFields
            });
        });
    });

    // Add new custom field section
    addCustomFieldButton.addEventListener('click', () => {
        const customDiv = document.createElement('div');
        customDiv.classList.add('customField', 'field-container');
        customDiv.innerHTML = `
            <input type="checkbox" class="customFieldCheckbox">
            <input type="text" class="customFieldLabel" placeholder="Field Label">
            <input type="text" class="customFieldValue" placeholder="Field Value">
        `;
        customFieldContainer.appendChild(customDiv);
        saveData(); // Auto-save whenever a new custom field is added
    });

    // Save all data
    function saveData() {
        const selectedFields = {};

        // Collect all selected fields and their values
        document.querySelectorAll('.field-checkbox').forEach(checkbox => {
            const field = checkbox.dataset.field;
            const input = document.getElementById(field);
            if (input) {
                selectedFields[field] = input.value;
            }
        });

        // Collect custom fields (label and value)
        const customFields = [];
        document.querySelectorAll('.customField').forEach(field => {
            const label = field.querySelector('.customFieldLabel').value;
            const value = field.querySelector('.customFieldValue').value;
            if (label && value) {
                customFields.push({ label, value });
            }
        });

        // Save both selected fields and custom fields
        chrome.storage.local.set({
            selectedFields: selectedFields,
            customFields: customFields
        });
    }
});

// Autofill function to be injected into any form
function autofillForm() {
    chrome.storage.local.get(['selectedFields', 'customFields'], function(result) {
        const selectedFields = result.selectedFields || {};
        const customFields = result.customFields || [];

        // Fill in only the selected fields
        document.querySelectorAll('.field-checkbox:checked').forEach(checkbox => {
            const field = checkbox.dataset.field;
            const inputField = document.querySelector(`input[name="${field}"], textarea[name="${field}"]`);
            if (inputField) {
                inputField.value = selectedFields[field];
            }
        });

        // Fill in only the selected custom fields
        document.querySelectorAll('.customFieldCheckbox:checked').forEach(checkbox => {
            const fieldLabel = checkbox.closest('.customField').querySelector('.customFieldLabel').value;
            const customField = customFields.find(field => field.label === fieldLabel);
            if (customField) {
                const inputField = document.querySelector(`input[placeholder="${fieldLabel}"], textarea[placeholder="${fieldLabel}"]`);
                if (inputField) {
                    inputField.value = customField.value;
                }
            }
        });
    });
}
