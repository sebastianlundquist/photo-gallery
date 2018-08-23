let currentPhotoIndex = 0;
let photoCount = 0;
let insertPoint = document.getElementById("gallery");
let photoInfo = {
    userIDs: [],
    URLs: [],
    titles: []
};

/**
 * Gets photo data response from the flickr api, returns it it JSON format on resolve,
 * or returns an error code and message on reject.
 * @param text  - A search query for photos with a certain theme.
 * @param page  - Which page number of the search results to request.
 * @param count - The number of photos to request per page.
 * @param lat   - The latitude for the area to search for photos.
 * @param lon   - The longitude for the area to search for photos.
 * @returns {Promise<any>}
 */
function getPhotoData(text, page, count, lat, lon) {
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        xhr.addEventListener("load", (e) => {
            if (e.target.status === 200) {
                resolve(JSON.parse(e.target.response));
            }
            else {
                reject([404, "Server did not respond."]);
            }
        });
        xhr.open("GET", `https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=91311f10dd01517346db22e505210863&text=${text}&lat=${lat}&lon=${lon}&radius=32&format=json&per_page=${count}&nojsoncallback=1&page=${page}`);
        xhr.send();
    });
}

/**
 * Checks if the JSON data returned from the flickr api via getPhotoData is valid, stores the number of photos received
 * for future use and passes on the data on success. Displays an error message on fail.
 * @param photoArray    - The JSON data received from the flickr api via getPhotoData.
 * @returns {*}
 */
function checkValidCall(photoArray) {
    if (photoArray.stat === "fail") {
        errorHandler([photoArray.code, photoArray.message]);
    }
    else {
        photoCount = photoArray.photos.photo.length;
        return photoArray;
    }
}

/**
 * Stores information about the photos for future use by other functions and passes on the data.
 * @param photoArray    - The validated JSON photo data from the flickr api.
 * @returns {*}
 */
function updatePhotoInfo(photoArray) {
    for (let i = 0; i < photoCount; i++) {
        // Update URLs
        photoInfo.URLs.push(`https://farm${photoArray.photos.photo[i].farm}.staticflickr.com/${photoArray.photos.photo[i].server}/${photoArray.photos.photo[i].id}_${photoArray.photos.photo[i].secret}_n.jpg`);
        // Update userIDs
        photoInfo.userIDs.push(photoArray.photos.photo[i].id);
        // Update titles
        photoInfo.titles.push(photoArray.photos.photo[i].title);
    }
    return photoArray;
}

/**
 * Generates a container, a photo title and a link to the photographer's flickr page for every photo received from the
 * flickr api.
 * @param photoArray    - The validated JSON photo data from the flickr api.
 */
function generatePhotoContainers(photoArray) {
    let photoGroup = document.getElementById("photo-group");
    let photoTitle = "";
    let photographer = "";

    for (let i = 0; i < photoCount; i++) {
        if (photoInfo.titles[i] !== "") {
            photoTitle = photoInfo.titles[i];
        }
        else {
            photoTitle = "No title";
        }
        photographer = photoArray.photos.photo[i].owner;
        // Changed from element creation to innerHTML for performance and readability.
        photoGroup.innerHTML +=
            `<div id=div${i} class='responsive' tabindex='0' style='background-image: url(${photoInfo.URLs[i]})'><span class='grid-title'>${photoTitle}</span><a class='photographer' href='https://www.flickr.com/people/${photographer}'>&copy; user ${photographer}</a></div>`;
    }
}

/**
 * Adds all event listeners to the photo gallery as well as the fullscreen photo view.
 */
function addEventListeners() {
    // Gallery event listeners
    for (let i = 0; i < photoCount; i++) {
        document.getElementById("div" + i).addEventListener("click", () => {
            currentPhotoIndex = i;
            openFullscreen(i);
        });
        document.getElementById("div" + i).addEventListener("keyup", (e) => {
            if (e.key === "Enter") {
                currentPhotoIndex = i;
                openFullscreen(i);
            }
        });
        // Stopping event propagation for the photographer links to prevent them from opening the fullscreen photo
        document.getElementsByClassName("photographer")[i].addEventListener("click", (e) => {
            e.stopPropagation();
        });
        document.getElementsByClassName("photographer")[i].addEventListener("keyup", (e) => {
            e.stopPropagation();
        });
    }
    document.getElementById("photo-group").addEventListener("keyup", (e) => {
        if (e.key === "ArrowLeft" && currentPhotoIndex > 0) {
            currentPhotoIndex--;
            document.getElementById("div" + (currentPhotoIndex)).focus();
        }
        if (e.key === "ArrowRight" && currentPhotoIndex < photoCount-1) {
            currentPhotoIndex++;
            document.getElementById("div" + (currentPhotoIndex)).focus();
        }
    });

    // Fullscreen event listeners
    document.getElementById("fullscreen-container").addEventListener("keyup", (e) => {
        if (e.key === "ArrowLeft") {
            nextPhoto(-1);
        }
        if (e.key === "ArrowRight") {
            nextPhoto(1);
        }
        if (e.key === "Escape") {
            closeFullscreen(currentPhotoIndex);
        }
    });
    document.getElementById("close").addEventListener("click", () => {
        closeFullscreen(currentPhotoIndex);
    });
    document.getElementById("close").addEventListener("keyup", (e) => {
        if (e.key === "Enter") {
            closeFullscreen(currentPhotoIndex);
        }
    });
    document.getElementById("next").addEventListener("click", () => {
        nextPhoto(1);
    });
    document.getElementById("next").addEventListener("keyup", (e) => {
        if (e.key === "Enter") {
            nextPhoto(1);
        }
    });
    document.getElementById("previous").addEventListener("click", () => {
        nextPhoto(-1);
    });
    document.getElementById("previous").addEventListener("keyup", (e) => {
        if (e.key === "Enter") {
            nextPhoto(-1);
        }
    });
}

/**
 * Modifies a flickr photo URL to the same photo in another resolution.
 * @param URL   -   The URL to modify.
 * @param size  -   The size suffix representing the desired photo resolution.
 *                  Valid suffixes are 's', 'q', 't', 'm', 'n', 'z', 'c', 'b', 'h', 'k' and 'o'.
 *                  See respective resolutions at https://www.flickr.com/services/api/misc.urls.html.
 * @returns {void|string|*}
 */
function modifyURL(URL, size) {
    return URL.replace("_n.", "_" + size + ".");
}

/**
 * Opens a selected photo in fullscreen view, with a higher resolution.
 * @param index - The index of the photo to view.
 */
function openFullscreen(index) {
    let displayImage = document.getElementById("display-image");
    let title = document.getElementById("fullscreen-title");

    displayImage.setAttribute("src", modifyURL(photoInfo.URLs[index], "h"));
    if (photoInfo.titles[index] !== "") {
        displayImage.setAttribute("alt", photoInfo.titles[index]);
        title.innerText = photoInfo.titles[index];
    }
    else {
        displayImage.setAttribute("alt", "");
        title.innerText = "No title";
    }
    // Display container, move keyboard focus and hide background so that keyboard users don't keep navigating the background
    document.getElementById("fullscreen-container").style.display = "block";
    document.getElementById("close").focus();
    document.getElementById("photo-group").style.display = "none";
}

/**
 * Closes the fullscreen view.
 * @param index - The current photo index to retain correct keyboard focus after close.
 */
function closeFullscreen(index) {
    document.getElementById("fullscreen-container").style.display = "none";
    document.getElementById("photo-group").style.display = "block";
    // Move keyboard focus back to the photo that was expanded
    document.getElementById("div" + index).focus();
}

/**
 * Cycles through photos in the fullscreen view.
 * @param step  - 1 if we want to go to the next photo, or -1 if we want to go to the previous photo.
 */
function nextPhoto(step) {
    let displayImage = document.getElementById("display-image");
    let title = document.getElementById("fullscreen-title");
    // Change index if it is within our boundaries
    if (step === 1 && currentPhotoIndex < photoInfo.URLs.length - 1) currentPhotoIndex++;
    else if (step === -1 && currentPhotoIndex > 0) currentPhotoIndex--;

    displayImage.setAttribute("src", modifyURL(photoInfo.URLs[currentPhotoIndex], "h"));
    if (photoInfo.titles[currentPhotoIndex] !== "") {
        displayImage.setAttribute("alt", photoInfo.titles[currentPhotoIndex]);
        title.innerText = photoInfo.titles[currentPhotoIndex];
    }
    else {
        displayImage.setAttribute("alt", "");
        title.innerText = "No title";
    }
}

/**
 * Displays an error message.
 * @param err   - An array with an error code [0] and an error message [1].
 */
function errorHandler(err) {
    document.body.classList.remove("🐹");
    insertPoint.innerHTML +=
        `<div id='error-container'><h1 id='error-header'>${err[0]}</h1><p id='error-message'>${err[1]}</p></div>`;
}

getPhotoData(
    insertPoint.getAttribute("data-text"),
    insertPoint.getAttribute("data-page"),
    insertPoint.getAttribute("data-count"),
    insertPoint.getAttribute("data-lat"),
    insertPoint.getAttribute("data-lon"))
    .then(checkValidCall, errorHandler)
    .then(updatePhotoInfo)
    .then(generatePhotoContainers)
    .then(addEventListeners);