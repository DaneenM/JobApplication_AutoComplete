document.addEventListener('DOMContentLoaded', () => {
    const addJobButton = document.getElementById('addJobExperience');
    const jobContainer = document.getElementById('jobExperienceContainer');
  
    // Save data to Chrome storage
    document.getElementById('saveData').addEventListener('click', () => {
      const selectedFields = {};
  
      // Collect all selected fields and values
      document.querySelectorAll('.field-checkbox').forEach(checkbox => {
        if (checkbox.checked) {
          const field = checkbox.dataset.field;
          const input = document.getElementById(field) || document.querySelector(`.${field}`);
          selectedFields[field] = input ? input.value : '';
        }
      });
  
      // Save the selected data to Chrome storage
      chrome.storage.local.set(selectedFields, () => {
        alert('Selected data saved!');
      });
    });
  
    // Apply the selected fields to a job application
    document.getElementById('applyData').addEventListener('click', () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          function: autofillJobApplication
        });
      });
    });
  
    // Allow dynamic addition of job experiences
    addJobButton.addEventListener('click', () => {
      const jobDiv = document.createElement('div');
      jobDiv.classList.add('jobExperience', 'field-container');
      jobDiv.innerHTML = `
        <label><input type="checkbox" class="field-checkbox" data-field="jobTitle"> Job Title</label>
        <button class="delete-field" data-field="jobTitle">Delete</button>
        <input type="text" class="jobTitle" placeholder="Job Title">
      `;
      jobContainer.appendChild(jobDiv);
    });
  
    // Handle field deletion
    document.body.addEventListener('click', (event) => {
      if (event.target.classList.contains('delete-field')) {
        const field = event.target.dataset.field;
        document.querySelector(`[data-field="${field}"]`).closest('.field-container').remove();
        chrome.storage.local.remove(field, () => {
          console.log(`${field} deleted from storage`);
        });
      }
    });
  
    // Hook into job title input to suggest fields
    document.getElementById('jobTitle').addEventListener('input', (event) => {
      suggestFields(event.target.value);  // Call the suggestFields function when job title is entered
    });
  });
  
  // Autofill function to be injected into the job application page
  function autofillJobApplication() {
    chrome.storage.local.get(null, function(result) {
      for (const field in result) {
        const inputField = document.querySelector(`input[name="${field}"], textarea[name="${field}"]`);
        if (inputField) {
          inputField.value = result[field];
        }
      }
    });
  }
  
  // Suggest fields based on job title
  function suggestFields(jobTitle) {
    if (jobTitle.toLowerCase().includes('software')) {
      // Add suggestions for software-related jobs
      alert('You may want to include: Programming Languages, Frameworks');
    } else if (jobTitle.toLowerCase().includes('manager')) {
      // Add suggestions for manager-related jobs
      alert('You may want to include: Management Skills, Leadership Experience');
    }
  }
  