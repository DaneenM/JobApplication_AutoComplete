// Check if the current page has job application fields
window.onload = function() {
    const nameField = document.querySelector('input[name="name"], input[name="full_name"]');
    const emailField = document.querySelector('input[name="email"]');
    const phoneField = document.querySelector('input[name="phone"], input[type="tel"]');
    const addressField = document.querySelector('input[name="address"]');
    const jobTitleFields = document.querySelectorAll('input[name="job_title"], input[name="jobTitle"]');
    const companyFields = document.querySelectorAll('input[name="company"]');
    const workExperienceFields = document.querySelectorAll('textarea[name="work_experience"]');
    const degreeFields = document.querySelectorAll('textarea[name="degree"]');
    const schoolFields = document.querySelectorAll('textarea[name="school"]');

    // Retrieve stored data from Chrome storage
    chrome.storage.local.get(['name', 'email', 'phone', 'address', 'jobExperiences', 'educationEntries'], function(result) {
        if (nameField) nameField.value = result.name || '';
        if (emailField) emailField.value = result.email || '';
        if (phoneField) phoneField.value = result.phone || '';
        if (addressField) addressField.value = result.address || '';

        // Fill multiple job experiences
        result.jobExperiences?.forEach((job, index) => {
            if (jobTitleFields[index]) jobTitleFields[index].value = job.jobTitle;
            if (companyFields[index]) companyFields[index].value = job.company;
            if (workExperienceFields[index]) workExperienceFields[index].value = job.workExperience;
        });

        // Fill multiple education entries
        resu
