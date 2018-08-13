(function () {
    var currentPhotoIndex = 0;
    var photoCount = 0;
    var insertPoint = document.getElementById("gallery");
    var photoInfo = {
        userIDs: [],
        URLs: [],
        titles: []
    };

    function getPhotoData(callback, text, page, count, lat, lon) {
        var xhr = new XMLHttpRequest();
        xhr.addEventListener("load", function (e) {
            var obj = {};
            try {
                if (e.target.status !== 200) {
                    errorHandler([404, "Response failed."]);
                }
                else {
                    obj = JSON.parse(e.target.response);
                    callback(obj);
                }
            }
            catch(err) {
                errorHandler(err);
            }
        });
        xhr.open("GET", "https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=91311f10dd01517346db22e505210863" +
            "&text=" + text + "&lat=" + lat + "&lon=" + lon + "&radius=32&format=json&per_page=" + count + "&nojsoncallback=1&page=" + page);
        xhr.send();
    }

    function generateContent(result) {
        try {
            if (result.stat === "fail") {
                errorHandler([result.code, result.message]);
            }
            else {
                photoCount = result.photos.photo.length;
                updatePhotoInfo(result);
                generatePhotoContainers(result);
                generateFullscreenContainer();
                addEventListeners();
            }
        }
        catch(err) {
            console.log(err);
            errorHandler(err);
        }
    }

    function generateFullscreenContainer() {
        var fullscreenContainer = document.createElement("div");
        var closeButton = document.createElement("span");
        var fullscreenContent = document.createElement("div");
        var slide = document.createElement("div");
        var displayImage = document.createElement("img");
        var previous = document.createElement("a");
        var previousSpan = document.createElement("span");
        var next = document.createElement("a");
        var nextSpan = document.createElement("span");
        var titleContainer = document.createElement("div");
        var title = document.createElement("p");

        fullscreenContainer.setAttribute("id", "fullscreen-container");
        closeButton.setAttribute("id", "close");
        closeButton.setAttribute("tabindex", "0");
        fullscreenContent.setAttribute("id", "fullscreen-content");
        slide.setAttribute("id", "slide");
        displayImage.setAttribute("id", "display-image");
        previous.setAttribute("id", "previous");
        previous.setAttribute("tabindex", "0");
        next.setAttribute("id", "next");
        next.setAttribute("tabindex", "0");
        titleContainer.setAttribute("id", "fullscreen-title-container");
        title.setAttribute("id", "fullscreen-title");

        closeButton.innerText = "\u00d7";   // Multiplication sign
        previousSpan.innerText = "\u276e";  // Left arrow
        nextSpan.innerText = "\u276f";      // Right arrow

        insertPoint.appendChild(fullscreenContainer);
        fullscreenContainer.appendChild(closeButton);
        fullscreenContainer.appendChild(fullscreenContent);
        fullscreenContainer.appendChild(titleContainer);
        fullscreenContent.appendChild(slide);
        fullscreenContent.appendChild(previous);
        fullscreenContent.appendChild(next);
        slide.appendChild(displayImage);
        titleContainer.appendChild(title);
        previous.appendChild(previousSpan);
        next.appendChild(nextSpan);
    }

    function updatePhotoInfo(photoArray) {
        var i;
        for (i = 0; i < photoCount; i++) {
            photoInfo.URLs.push("https://farm" +
                photoArray.photos.photo[i].farm + ".staticflickr.com/" +
                photoArray.photos.photo[i].server + "/" +
                photoArray.photos.photo[i].id + "_" +
                photoArray.photos.photo[i].secret + "_n.jpg");

            photoInfo.userIDs.push(photoArray.photos.photo[i].id);

            photoInfo.titles.push(photoArray.photos.photo[i].title);
        }
    }

    function generatePhotoContainers(photoArray) {
        var i;
        var photoContainer;
        var titleSpan;
        var photographerLink;
        var photoGroup = document.createElement("div");

        photoGroup.setAttribute("id", "photo-group");

        insertPoint.appendChild(photoGroup);

        for (i = 0; i < photoCount; i++) {
            photoContainer = document.createElement("div");
            titleSpan = document.createElement("span");
            photographerLink = document.createElement("a");

            photoContainer.setAttribute("id", "div" + i);
            photoContainer.setAttribute("class", "responsive");
            photoContainer.setAttribute("tabindex", "0");
            photoContainer.setAttribute("style", "background-image: url('" + photoInfo.URLs[i] + "')");
            titleSpan.setAttribute("class", "grid-title");
            photographerLink.setAttribute("class", "photographer");
            photographerLink.setAttribute("href", "https://www.flickr.com/people/" + photoArray.photos.photo[i].owner);

            photoGroup.appendChild(photoContainer);
            photoContainer.appendChild(titleSpan);
            photoContainer.appendChild(photographerLink);

            if (photoInfo.titles[i] !== "") {
                titleSpan.innerText = photoInfo.titles[i];
            }
            else {
                titleSpan.innerText = "No title";
            }
            photographerLink.innerText = "\u00A9 user " + photoArray.photos.photo[i].owner; // Copyright symbol
        }
    }

    function addEventListeners() {
        var i;
        var j;
        var eventListeners = [];

        // Gallery event listeners
        function createListener(index) {
            document.getElementById("div" + index).addEventListener("click", function () {
                currentPhotoIndex = index;
                openFullscreen(index);
            });
            document.getElementById("div" + index).addEventListener("keyup", function (e) {
                if (e.key === "Enter") {
                    currentPhotoIndex = index;
                    openFullscreen(index);
                }
            });
            // Stopping event propagation for the photographer links to prevent them from opening the fullscreen photo
            document.getElementsByClassName("photographer")[index].addEventListener("click", function (e) {
                e.stopPropagation();
            });
            document.getElementsByClassName("photographer")[index].addEventListener("keyup", function (e) {
                e.stopPropagation();
            });
        }
        for (i = 0; i < photoCount; i++) {
            eventListeners[i] = createListener.bind(this, i);
        }
        for (j = 0; j < photoCount; j++) {
            eventListeners[j]();
        }
        document.getElementById("photo-group").addEventListener("keyup", function (e) {
            if (e.key === "ArrowLeft" && currentPhotoIndex > 0) {
                currentPhotoIndex--;
                document.getElementById("div" + (currentPhotoIndex)).focus();
            }
            if (e.key === "ArrowRight"  && currentPhotoIndex < photoCount-1) {
                currentPhotoIndex++;
                document.getElementById("div" + (currentPhotoIndex)).focus();
            }
        });

        // Fullscreen event listeners
        document.getElementById("fullscreen-container").addEventListener("keyup", function (e) {
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
        document.getElementById("close").addEventListener("click", function () {
            closeFullscreen(currentPhotoIndex);
        });
        document.getElementById("close").addEventListener("keyup", function (e) {
            if (e.key === "Enter") {
                closeFullscreen(currentPhotoIndex);
            }
        });
        document.getElementById("next").addEventListener("click", function () {
            nextPhoto(1);
        });
        document.getElementById("next").addEventListener("keyup", function (e) {
            if (e.key === "Enter") {
                nextPhoto(1);
            }
        });
        document.getElementById("previous").addEventListener("click", function () {
            nextPhoto(-1);
        });
        document.getElementById("previous").addEventListener("keyup", function (e) {
            if (e.key === "Enter") {
                nextPhoto(-1);
            }
        });
    }

    // Changes the URL to link to the same photo but another resolution
    function modifyURL(URL, size) {
        return URL.replace("_n.", "_" + size + ".");
    }

    function openFullscreen(index) {
        var displayImage = document.getElementById("display-image");
        var title = document.getElementById("fullscreen-title");

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

    function closeFullscreen(index) {
        document.getElementById("fullscreen-container").style.display = "none";
        document.getElementById("photo-group").style.display = "block";
        // Move keyboard focus back to the photo that was expanded
        document.getElementById("div" + index).focus();
    }

    function nextPhoto(step) {
        var displayImage = document.getElementById("display-image");
        var title = document.getElementById("fullscreen-title");
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

    function errorHandler(err) {
        var errorContainer = document.createElement("div");
        var errorHeader = document.createElement("h1");
        var errorDescription = document.createElement("p");

        errorContainer.setAttribute("id", "error-container");
        errorHeader.setAttribute("id", "error-header");
        errorDescription.setAttribute("id", "error-message");

        if (err[1] === "Response failed.") {
            errorHeader.innerText = err[1];
        }
        else {
            errorHeader.innerText = err[0];
            errorDescription.innerText = err[1];
        }

        errorContainer.appendChild(errorHeader);
        errorContainer.appendChild(errorDescription);
        insertPoint.appendChild(errorContainer);
    }

    getPhotoData(
        generateContent,
        insertPoint.getAttribute("data-text"),
        insertPoint.getAttribute("data-page"),
        insertPoint.getAttribute("data-count"),
        insertPoint.getAttribute("data-lat"),
        insertPoint.getAttribute("data-lon")
    );
})();