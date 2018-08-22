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
                    errorHandler([404, "Server did not respond."]);
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
                addEventListeners();
            }
        }
        catch(err) {
            console.log(err);
            errorHandler(err);
        }
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
        var photoGroup = document.getElementById("photo-group");
        var photoTitle = "";
        var photographer = "";

        for (i = 0; i < photoCount; i++) {
            if (photoInfo.titles[i] !== "") {
                photoTitle = photoInfo.titles[i];
            }
            else {
                photoTitle = "No title";
            }
            photographer = photoArray.photos.photo[i].owner;
            // Changed from element creation to innerHTML for performance and readability.
            photoGroup.innerHTML +=
                "<div id='div" + i + "' class='responsive' tabindex='0' style='background-image: url(" + photoInfo.URLs[i] + ")'>\n" +
                "    <span class='grid-title'>" + photoTitle + "</span>\n" +
                "    <a class='photographer' href='https://www.flickr.com/people/" + photographer + "'>&copy; user " + photographer + "</a>\n" +
                "</div>";
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
            if (e.key === "ArrowRight" && currentPhotoIndex < photoCount-1) {
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
        insertPoint.innerHTML +=
            "<div id='error-container'>\n" +
            "    <h1 id='error-header'>" + err[0] + "</h1>\n" +
            "    <p id='error-message'>" + err[1] + "</p>\n" +
            "</div>";
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