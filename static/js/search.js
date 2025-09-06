function isValidUrl(url) {
  try {
    const parsedUrl = new URL(url, window.location.origin);
    return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
  } catch (e) {
    return false;
  }
}

let debounceTimeout;
function searchOnChange(evt) {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    performSearch(evt);
  }, 300); // Debounce delay of 300ms
}

function searchOnFocus(evt) {
  const searchQuery = evt.target.value.trim();
  const searchContent = document.getElementById("search-content");
  if (searchQuery && searchContent && searchContent.style.display !== "block") {
    performSearch(evt);
  }
}

async function performSearch(evt) {
  let searchQuery = evt.target.value.trim().toLowerCase();

  if (searchQuery !== "") {
    const searchButtonEle = document.querySelectorAll("#search");
    const searchContent = document.getElementById("search-content");

    if (searchButtonEle.length < 2) {
      console.error("Search button elements missing!");
      return;
    }

    // Position search results based on screen size
    const isDesktop = window.innerWidth > 768;
    const searchButtonPosition = searchButtonEle[isDesktop ? 0 : 1].getBoundingClientRect();

    searchContent.style.width = isDesktop ? "500px" : "300px";
    searchContent.style.top = searchButtonPosition.top + 50 + "px";
    searchContent.style.left = searchButtonPosition.left + "px";

    try {
      let response = await fetch("/index.json");
      if (!response.ok) {
        throw new Error("Failed to fetch search data");
      }

      let searchJson = await response.json();

      let searchResults = searchJson.filter((item) => {
        if (!item || typeof item !== "object") return false;
        if (!item.title && !item.description && !item.content) return false;

        return (
          (item.title && item.title.toLowerCase().includes(searchQuery)) ||
          (item.description && item.description.toLowerCase().includes(searchQuery)) ||
          (item.content && item.content.toLowerCase().includes(searchQuery))
        );
      });

      const searchResultsContainer = document.getElementById("search-results");
      searchResultsContainer.innerHTML = ""; // Clear previous results

      if (searchResults.length > 0) {
        searchResults.forEach((item) => {
          if (!item.permalink || !isValidUrl(item.permalink)) {
            console.warn("Skipping invalid search result:", item);
            return;
          }

          const card = document.createElement("div");
          card.className = "card";

          const link = document.createElement("a");
          link.href = item.permalink; // Safe, since we validated it
          link.addEventListener("click", function() {
            document.getElementById("search-content").style.display = "none";
            document.getElementById("search-results").innerHTML = "";
          });

          const contentDiv = document.createElement("div");
          contentDiv.className = "p-3";

          const title = document.createElement("h5");
          title.textContent = item.title || "Untitled"; // Use textContent to prevent XSS

          const description = document.createElement("div");
          description.textContent = item.description || "No description available"; // Safe

          contentDiv.appendChild(title);
          contentDiv.appendChild(description);
          link.appendChild(contentDiv);
          card.appendChild(link);
          searchResultsContainer.appendChild(card);
        });
      } else {
        const noResultsMessage = document.createElement("p");
        noResultsMessage.className = "text-center py-3";
        noResultsMessage.textContent = `No results found for "${searchQuery}"`;
        searchResultsContainer.appendChild(noResultsMessage);
      }

      searchContent.style.display = "block";
    } catch (error) {
      console.error("Error fetching search data:", error);
    }
  } else {
    const searchContent = document.getElementById("search-content");
    const searchResults = document.getElementById("search-results");
    if (searchContent) searchContent.style.display = "none";
    if (searchResults) searchResults.innerHTML = "";
  }
}

// Add click-outside functionality to close search results
document.addEventListener("DOMContentLoaded", function() {
  document.addEventListener("click", function(event) {
    const searchContent = document.getElementById("search-content");

    // Only proceed if search content exists and is visible
    if (!searchContent || searchContent.style.display !== "block") {
      return;
    }

    // Check if click is outside search area (content + inputs)
    const searchInputs = document.querySelectorAll("#search");
    const clickedOnSearch = searchContent.contains(event.target) ||
                           Array.from(searchInputs).some(input => input.contains(event.target));

    // If clicked outside, hide search results
    if (!clickedOnSearch) {
      searchContent.style.display = "none";
      document.getElementById("search-results").innerHTML = "";
    }
  });
});
