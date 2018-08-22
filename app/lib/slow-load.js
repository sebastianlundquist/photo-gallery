"use strict";

(function () {
    var slowLoadDiv = document.createElement("div");
    slowLoadDiv.setAttribute("id", "slow-load");
    var slowLoad = window.setTimeout(function () {
        var slowLoadContent = document.createElement("div");
        var slowLoadClose = document.createElement("span");
        var slowLoadText = document.createElement("p");
        var insertPoint = document.getElementById("gallery");

        slowLoadContent.setAttribute("id", "slow-load-content");
        slowLoadClose.setAttribute("id", "slow-load-close");
        slowLoadText.setAttribute("id", "slow-load-text");

        slowLoadClose.innerText = "\xD7"; // Multiplication sign
        slowLoadText.innerText = "The page is taking a while to load";

        insertPoint.appendChild(slowLoadDiv);
        slowLoadDiv.appendChild(slowLoadContent);
        slowLoadContent.appendChild(slowLoadClose);
        slowLoadContent.appendChild(slowLoadText);

        slowLoadClose.addEventListener("click", function () {
            slowLoadDiv.parentNode.removeChild(slowLoadDiv);
            slowLoadDiv = null;
        });
    }, 10);

    window.addEventListener("load", function () {
        window.clearTimeout(slowLoad);
        if (slowLoadDiv !== null && slowLoadDiv.parentNode !== null) {
            slowLoadDiv.parentNode.removeChild(slowLoadDiv);
        }
    }, false);
})();