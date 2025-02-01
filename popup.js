document.addEventListener('DOMContentLoaded', function() {
    const submitBtn = document.getElementById('submit-btn');
    const dataPageBtn = document.getElementById('data-page-btn'); // New button for opening data page
    const tagElements = document.querySelectorAll('.tag');

    let selectedTags = [];

    // Toggle tag selection
    tagElements.forEach(tag => {
        tag.addEventListener('click', function() {
            tag.classList.toggle('selected');
            if (tag.classList.contains('selected')) {
                selectedTags.push(tag.id);
            } else {
                selectedTags = selectedTags.filter(item => item !== tag.id);
            }
        });
    });

    // Submit data to the Flask server
    submitBtn.addEventListener('click', function() {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            const videoUrl = tabs[0].url;
            const videoTitle = tabs[0].title;

            if (videoUrl.includes("youtube.com")) {
                // Send data to Flask server
                fetch('http://localhost:5000/api/store-data', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        video_url: videoUrl,
                        tags: selectedTags
                    })
                })
                .then(response => response.json())
                .then(data => {
                    alert('Data stored successfully');
                })
                .catch(error => {
                    console.error('Error:', error);
                });
            } else {
                alert('This extension only works for YouTube videos.');
            }
        });
    });

    // Open the Data Page when the button is clicked
    dataPageBtn.addEventListener('click', function() {
        // Opens the data_page.html in a new tab
        chrome.tabs.create({ url: chrome.runtime.getURL('data_page.html') });
    });
});
