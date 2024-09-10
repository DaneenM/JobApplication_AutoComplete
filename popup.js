document.addEventListener('DOMContentLoaded', () => {
    const addJobButton = document.getElementById('addJobExperience');
    const addEducationButton = document.getElementById('addEducation');
    const jobContainer = document.getElementById('jobExperienceContainer');
    const educationContainer = document.getElementById('educationContainer');
    
    // Add another Job Experience entry
    addJobButton.addEventListener('click', () => {
      const jobDiv = document.createElement('div');
      jobDiv.classList.add('jobExperience');
      jobDiv.innerHTML = `
        <input type="text" class="jobTitle" placeholder="Job Title">
        <input type="text" class="company" placeholder="Company Name">
        <textarea class="workExperience" placeholder="Work Experience"></textarea>
      `;
      jobContainer.appendChild(jobDiv);
    });
  
    // Add another Education entry
    addEducationButton.addEventListener('click', () => {
      const eduDiv = document.createElement('div');
      eduDiv.classList.add('education');
      eduDiv.innerHTML = `
        <textarea class="degree" placeholder="Degree/Certification"></textarea>
        <textarea class="school" placeholder="School/Institution"></textarea>
      `;
      educationContainer.appendChild(eduDiv);
    });
  
    // Save data to Chrome storage
    document.getElementById('saveData').addEventListener('click', () => {
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const phone = document.getElementById('phone').value;
      const address = document.getElementById('address').value;
  
      // Collect all Job Experience entries
      const jobExperiences = [];
      document.querySelectorAll('.jobExperience').forEach(job => {
        const jobTitle = job.querySelector('.jobTitle').value;
        const company = job.querySelector('.company').value;
        const workExperience = job.querySelector('.workExperience').value;
        if (jobTitle && company) {
          jobExperiences.push({ jobTitle, company, workExperience });
        }
      });
  
      // Collect all Education entries
      const educationEntries = [];
      document.querySelectorAll('.education').forEach(edu => {
        const degree = edu.querySelector('.degree').value;
        const school = edu.querySelector('.school').value;
        if (degree && school) {
          educationEntries.push({ degree, school });
        }
      });
  
      // Save everything to Chrome storage
      chrome.storage.local.set({
        name: name,
        email: email,
        phone: phone,
        address: address,
        jobExperiences: jobExperiences,
        educationEntries: educationEntries
      }, () => {
        alert('Data saved!');
      });
    });
  });
  