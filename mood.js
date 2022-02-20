BING_ENDPOINT = "https://api.bing.microsoft.com/v7.0/images/search";

selected_img_urls = [];  // store the urls of selected images (images to be shown on mood board)


function addSelectedImage(id) {
    // add the url of selected image to 'selected_img_urls'

    let selected_img = document.getElementById(id);
    selected_img.style.filter = "brightness(40%)";
    let selected_img_src = selected_img.src;

    if (selected_img_urls.includes(selected_img_src)) {
        // click an image twice to unselect an image
        selected_img.style.filter = "brightness(100%)";
        selected_img_urls.splice(selected_img_urls.indexOf(selected_img_src), 1);
    } else {
        // click an image once to select an image
        selected_img_urls.push(selected_img_src);
    }
}

function displaySelectedImages() {
    // display all selected images onto mood board

    clearSearch();
    clearSuggestions();

    document.getElementById("exitButton").style.display = "none";
    let selected_images = document.getElementById("selected_imgs");

    selected_img_urls.forEach(displaySelectedImage);

    function displaySelectedImage(value) {
        let curr_selected_img = document.createElement("img");
        curr_selected_img.src = value;
        selected_images.appendChild(curr_selected_img);
    }
}

function runSearch(original_query = null) {
    // search and display related concepts and image results

    document.getElementById("exitButton").style.display = "block";

    let query;
    if (original_query == null) {
        // if search is initiated by user's input, set query to be user's input
        query = document.querySelector(".search .form input").value;
    } else {
        // if search is initiated by clicking on related concept, set query to be related concept
        query = original_query;
    }

    let queryurl = BING_ENDPOINT + "?q=" + encodeURIComponent(query);

    let request = new XMLHttpRequest();

    request.onload = function () {
        // display related concepts and image results

        clearSearch();
        clearMoodBoard();
        clearSuggestions();

        let json_results = JSON.parse(this.responseText);

        // display related concepts
        let suggestions_list = document.getElementById("suggestions_list");
        for (let i = 0; i < json_results['queryExpansions'].length; i++) {
            let curr_suggestion = document.createElement("a");
            curr_suggestion.innerHTML = json_results['queryExpansions'][i]['text'];
            curr_suggestion.href = "#";
            curr_suggestion.title = json_results['queryExpansions'][i]['text'];
            curr_suggestion.setAttribute("onclick", "runSearch(this.title)");
            suggestions_list.appendChild(curr_suggestion);
        }

        // display image results
        let img_results = document.getElementById('img_search_results');
        for (let i = 0; i < json_results['value'].length; i++) {
            let curr_img = document.createElement("img");
            curr_img.src = json_results['value'][i]['contentUrl'];
            curr_img.id = "img_result_" + i.toString();
            curr_img.setAttribute("onclick", "addSelectedImage(this.id)");
            img_results.appendChild(curr_img);
        }
    }

    request.open("GET", queryurl);
    request.setRequestHeader("Ocp-Apim-Subscription-Key", BING_API_KEY);
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    request.send();

    handleBingResponse();

    return false;  // Keep this; it keeps the browser from sending the event
    // further up the DOM chain. Here, we don't want to trigger
    // the default form submission behavior.
}

function handleBingResponse() {
    window.location.hash = "results";
}

function closeSeachPane() {
    window.location.hash = "";
}

function clearSearch() {
    // clear search results

    document.querySelector(".search .form input").value = "";
    document.getElementById('img_search_results').innerHTML = "";
}

function clearMoodBoard() {
    // clear mood board

    document.getElementById('selected_imgs').innerHTML = "";
}

function clearSuggestions() {
    // clear related concepts

    document.getElementById("suggestions_list").innerHTML = "";
}

document.querySelector("#exitButton").addEventListener("click", closeSeachPane);
