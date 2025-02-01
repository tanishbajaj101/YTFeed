// Global variables
let injectingVideos = false;
let allVideos = []; // Array to hold all video details

// Function to format views into compact format (e.g., 56K, 1M)
function formatViews(views) {
  if (views >= 1000000) {
    return `${(views / 1000000).toFixed(1)}M views`;
  } else if (views >= 1000) {
    return `${(views / 1000).toFixed(0)}K views`;
  } else {
    return `${views} views`;
  }
}

// Function to format time into relative format (e.g., "1 day ago", "3 weeks ago")
function formatTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`;
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 31536000) {
    const months = Math.floor(diffInSeconds / 2592000);
    return `${months} month${months > 1 ? 's' : ''} ago`;
  } else {
    const years = Math.floor(diffInSeconds / 31536000);
    return `${years} year${years > 1 ? 's' : ''} ago`;
  }
}

// Function to fetch video details from the server for a specific tag
function fetchVideos(tag) {
  console.log(`Fetching videos for tag: ${tag}`);
  fetch(`http://localhost:5000/api/get-cached-videos/${tag}`)
    .then((response) => response.json())
    .then((data) => {
      console.log(`Videos fetched for ${tag}:`, data); // Log the fetched data
      // Add fetched videos to the allVideos array
      const formattedVideos = data.map((entry) => ({
        videoId: entry.video_id,
        thumbnail: entry.thumbnail_url,
        title: entry.title,
        views: formatViews(entry.view_count), // Format views
        timeAgo: formatTimeAgo(entry.video_created_at), // Format time
        channelName: entry.channel_name || "Unknown Channel",
        channelPhoto: entry.channel_photo_url || "",
        tag: tag, // Include the tag for reference
      }));
      allVideos = [...allVideos, ...formattedVideos]; // Add to the allVideos array
    })
    .catch((error) => {
      console.error("Error fetching videos:", error);
    });
}

// Function to inject all videos into the YouTube feed
function injectVideos() {
  const feed = document.querySelector("#contents"); // YouTube's feed container
  console.log("Injecting all videos"); // Debug log

  if (feed && allVideos.length > 0) {
    // Check if the videos are already injected to prevent duplication
    let existingFlex = document.querySelector("#custom-video-flex");
    if (existingFlex) {
      return; // Skip if videos are already injected
    }

    // Create a container for all videos
    const videoFlex = document.createElement("div");
    videoFlex.id = "custom-video-flex";
    videoFlex.className = "custom-video-flex";

    // Inject all videos into the flex container
    allVideos.forEach((video) => {
      const videoElement = document.createElement("div");
      videoElement.className = "custom-video-item";

      videoElement.innerHTML = `
        <a href="https://www.youtube.com/watch?v=${video.videoId}" class="custom-video-link" target="_blank">
          <div class="thumbnail-container">
            <img src="${video.thumbnail}" alt="${video.title}" class="thumbnail">
            <div class="tag-badge">#${video.tag}</div> <!-- Tag badge added here -->
          </div>
          <div class="video-details">
            <div class="channel-info">
              <img src="${video.channelPhoto}" alt="Channel Photo" class="channel-photo">
            </div>
            <div class="video-info">
              <div class="video-title">${video.title}</div>
              <div class="channel-name">${video.channelName}</div>
              <div class="meta-info">
                <span class="views">${video.views}</span>
                <span class="time-ago">${video.timeAgo}</span>
              </div>
            </div>
          </div>
        </a>
      `;

      videoFlex.appendChild(videoElement);
    });

    // Insert the video flex container into the feed
    const firstChild = feed.firstChild;
    feed.insertBefore(videoFlex, firstChild); // Insert the videos at the top of the feed
  } else {
    console.error("Feed not found or no videos available");
  }
}

// Function to toggle video injection
function toggleInjection() {
  console.log("Toggle button clicked");
  injectingVideos = !injectingVideos; // Toggle the injection flag
  console.log("Injecting Videos:", injectingVideos);

  if (injectingVideos) {
    // If videos are to be injected, inject them
    injectVideos();
  } else {
    // Remove the custom video flex container
    const existingFlex = document.querySelector("#custom-video-flex");
    if (existingFlex) {
      existingFlex.remove();
    }
  }
}

// Function to create the toggle button
function createToggleButton() {
  const startContainer = document.querySelector("#start.style-scope.ytd-masthead");

  if (startContainer) {
    // Check for existing toggle button to prevent duplicates
    if (document.getElementById("custom-toggle-button")) return;

    // Create a button to toggle video injection
    const toggleButton = document.createElement("button");
    toggleButton.id = "custom-toggle-button";
    toggleButton.innerText = "Toggle Video Injection";

    // Add event listener to toggle video injection
    toggleButton.addEventListener("click", toggleInjection);

    // Append the button to the #start container
    startContainer.appendChild(toggleButton);
    console.log("Toggle button added");
  } else {
    console.error("Start container not found, retrying...");
    // Retry creating the button after a small delay
    setTimeout(createToggleButton, 500);
  }
}

// Function to detect dark mode
function isDarkModeEnabled() {
  const body = document.body;
  // Check for dark mode class or specific styles
  if (body.classList.contains('dark') || window.getComputedStyle(body).backgroundColor === 'rgb(15, 15, 15)') {
    return true;
  }
  return false;
}

// Function to apply styles based on the mode
function applyModeStyles() {
  const isDarkMode = isDarkModeEnabled();
  const customVideoFlex = document.querySelector(".custom-video-flex");

  if (customVideoFlex) {
    if (isDarkMode) {
      customVideoFlex.classList.add("dark-mode");
      customVideoFlex.classList.remove("light-mode");
    } else {
      customVideoFlex.classList.add("light-mode");
      customVideoFlex.classList.remove("dark-mode");
    }
  }
}

// Wait until the page loads and fetch all videos before creating the toggle button
window.addEventListener("load", () => {
  // Fetch videos for all tags
  const tags = ["mindless-fun", "lighthearted", "informative", "gaming", "til", "wholesome"];
  tags.forEach((tag) => fetchVideos(tag));

  // Create the toggle button on load
  createToggleButton();

  // Apply mode styles on load
  applyModeStyles();
});

// Observe changes to the body element to detect mode changes dynamically
const observer = new MutationObserver(applyModeStyles);
observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });