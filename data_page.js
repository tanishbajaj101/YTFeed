document.addEventListener('DOMContentLoaded', function() {
    const tagsContainer = document.getElementById('tags-container');
    const dataContainer = document.getElementById('data-container');
    
    // Handle tag click to filter videos
    tagsContainer.addEventListener('click', function(event) {
        if (event.target.classList.contains('tag')) {
            // Toggle selected state
            document.querySelectorAll('.tag').forEach(tag => tag.classList.remove('selected'));
            event.target.classList.add('selected');

            // Get the selected tag ID
            const selectedTag = event.target.id;

            // Fetch filtered data by tag from the server
            fetch(`http://localhost:5000/api/get-cached-videos/${selectedTag}`)
                .then(response => response.json())
                .then(data => {
                    // Loop through the videos and update the video cards
                    data.forEach((entry, index) => {
                        if (index < 4) {
                            const card = dataContainer.children[index];

                            // Update video thumbnail, title, and view count
                            card.querySelector('.video-thumbnail').src = entry.thumbnail_url;
                            card.querySelector('.video-title').textContent = entry.title;
                            card.querySelector('.video-views').textContent = `Views: ${entry.view_count}`;

                            const thumbnailElement = card.querySelector('.video-thumbnail');
                            thumbnailElement.addEventListener('click', function() {
                                window.open(`https://www.youtube.com/watch?v=${entry.video_id}`, '_blank');
                            });

                        }
                    });
                })
                .catch(error => {
                    console.error('Error fetching data by tag:', error);
                    dataContainer.innerHTML = '<p>Error loading data.</p>';
                });
        }
    });
});
