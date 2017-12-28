var currentLocation = "unknown";

function navTo(destination) {
    /*
        DESTINATIONS:
        * opener
        * loading
        * home
        * multiResults
        * result
        * impressum

    */

    if(destination === "opener") {
        document.getElementById("opener").style.display = "block";
        document.getElementById("loading").style.display = "none";
        document.getElementById("home").style.display = "none";
        document.getElementById("multiResults").style.display = "none";
        document.getElementById("result").style.display = "none";
        document.getElementById("impressum").style.display = "none";
        currentLocation = destination;
    }
    else if(destination === "loading") {
        document.getElementById("opener").style.display = "none";
        document.getElementById("loading").style.display = "block";
        document.getElementById("home").style.display = "none";
        document.getElementById("multiResults").style.display = "none";
        document.getElementById("result").style.display = "none";
        document.getElementById("impressum").style.display = "none";
        currentLocation = destination;
    }
    else if(destination === "home") {
        document.getElementById("opener").style.display = "none";
        document.getElementById("loading").style.display = "none";
        document.getElementById("home").style.display = "block";
        document.getElementById("multiResults").style.display = "none";
        document.getElementById("result").style.display = "none";
        document.getElementById("impressum").style.display = "none";
        currentLocation = destination;
    }
    else if(destination === "multiResults") {
        document.getElementById("opener").style.display = "none";
        document.getElementById("loading").style.display = "none";
        document.getElementById("home").style.display = "none";
        document.getElementById("multiResults").style.display = "block";
        document.getElementById("result").style.display = "none";
        document.getElementById("impressum").style.display = "none";
        currentLocation = destination;
    }
    else if(destination === "result") {
        document.getElementById("opener").style.display = "none";
        document.getElementById("loading").style.display = "none";
        document.getElementById("home").style.display = "none";
        document.getElementById("multiResults").style.display = "none";
        document.getElementById("result").style.display = "block";
        document.getElementById("impressum").style.display = "none";
        currentLocation = destination;
    }
    else if(destination === "impressum") {
        document.getElementById("opener").style.display = "none";
        document.getElementById("loading").style.display = "none";
        document.getElementById("home").style.display = "none";
        document.getElementById("multiResults").style.display = "none";
        document.getElementById("result").style.display = "none";
        document.getElementById("impressum").style.display = "block";
        currentLocation = destination;
    }
    else {
        console.warn("Could not Navigate to " + destination);
    }
}

function startSearch() {
    getMovie(document.getElementById("query").value);
    virtualCursor1Init();
}

function getMovie(title) {
    var payload = payload = {"content_types":null,"presentation_types":null, "providers":null, "genres":null, "languages":null, "release_year_from":null, "release_year_until":null,"monetization_types":null,"min_price":null,"max_price":null,"scoring_filter_types":null,"cinema_release":null,"query":null};

            payload.query = title;

            var http = new XMLHttpRequest();
            var url = "https://api.justwatch.com/titles/de_DE/popular";
            http.open("POST", url, false);
            http.onreadystatechange = function() {//Call a function when the state changes.
                if(http.readyState == 4 && http.status == 200) {
                    parseMovies(JSON.parse(http.responseText));
                }
            }
            http.send(JSON.stringify(payload));
        }

        var lastResult;

        function parseMovies(result) {
            navTo("loading");
            lastResult = result;
            document.getElementById("cards").innerHTML = "";
            for(var i = 0; i < result.items.length; i++) {
                var item = result.items[i];
                var title = item.title;
                var poster;
                try{
                	item.poster = item.poster.substring(0, item.poster.length-9);
                }
                catch(e) {
                	console.warn(e);
                }
            	poster = "http://images.justwatch.com" + item.poster  + "s592/Kino";
                if (item.object_type == "movie"){
                    item.object_type = "Film";
                } 
                else if (item.object_type == "show"){
                    item.object_type = "Serie";
                }
                var type = item.object_type;
                var release = item.original_release_year;
                var description = item.short_description;
                var minAge = "ab " + item.age_certification;

                showMovieCard(i, title, type, description, poster, minAge, release);
            }
            document.getElementById("result-query").innerHTML = document.getElementById("query").value;
            document.getElementById("result-quant").innerHTML = result.total_results + " Ergebnisse";
            navTo("multiResults");
        }

        function showMovieCard(i, title, type, description, poster, minAge, release) {
            document.getElementById("cards").innerHTML = document.getElementById("cards").innerHTML + '<div class="card" onclick="showDetails('+i+')" id="card-' + i + '"><div class="card-left"><img class="card-poster" src="' + poster + '"></div><div class="card-right"><h1 class="card-title">' + title + '<b class="card-subtitle">' + release + '</b></h1><h3 class="card-subsubtitle">' + type + '</h3><p class="card-description">' + description + '</p><p class="card-min-age">' + minAge + '</p></div></div>';
        }

        function showDetails(number) {
            navTo("loading");
            //Gather Data            
            var normalRating = true;
            var item = lastResult.items[number];
            var title = item.title;
            console.log(item.poster);
            var runtime;
            var poster = "http://images.justwatch.com" + item.poster  + "s592/Kino";
            if (item.object_type == "Film"){
                item.object_type = "Film";
                runtime = item.runtime + " Minuten";
            } 
            else if (item.object_type == "Serie"){
                item.object_type = "Serie";
                runtime = item.max_season_number + " Staffeln";
            }
            var year = item.original_release_year;
            var description = item.short_description;
            var rating;
            try {
                for(var i = 0; i < item.scoring.length; i++){
                    if(item.scoring[i].provider_type == "tmdb:score") {
                        rating = item.scoring[i].value;
                    }
                }
            }
            catch(e) {
                normalRating = false;
                rating = "Keine Angabe";
            }
            var minAge = "ab " + item.age_certification;
            var services = "";
            var flatrates = [];
            var shownBefore = [];
            var even = false;
            try {
                for(i = 0; i < item.offers.length; i++) {
                    if (shownBefore.includes(item.offers[i].provider_id)){
                        var additional;
                        var show = true;
                        if(item.offers[i].monetization_type == "flatrate") {
                            for(var j = 0; j < flatrates.length; j++){
                                if (flatrates[j] == item.offers[i].provider_id) {
                                    show = false;
                                }
                            }
                            additional = "Flatrate";
                            flatrates.push(item.offers[i].provider_id);
                        }
                        else if (item.offers[i].monetization_type == "buy") {
                            if (item.offers[i].presentation_type != "sd") {
                                show = false;
                            }
                            else {
                                additional = "ab €" + item.offers[i].retail_price + " kaufen";
                            }
                            if (item.offers[i].provider_id == 130) {
                                show = true;
                                additional = "€" + item.offers[i].retail_price;
                            }
                        }
                        else if (item.offers[i].monetization_type == "rent") {
                            if (item.offers[i].presentation_type != "sd") {
                                show = false;
                            }
                            else {
                                additional = "ab €" + item.offers[i].retail_price;
                            }
                            if (item.offers[i].provider_id == 130) {
                                additional = "€" + item.offers[i].retail_price;
                                show = true;
                            }
                        }
                        else {
                            show = false;
                        }
                        if(show) {
                            console.log("Adding " + additional + " to " + item.offers[i].provider_id);
                            document.getElementById("price-" + item.offers[i].provider_id).innerHTML += " / " + additional;
                        }
                    }
                    else {
                        var price;
                        var show = true;
                        if(item.offers[i].monetization_type == "flatrate") {
                            for(var j = 0; j < flatrates.length; j++){
                                if (flatrates[j] == item.offers[i].provider_id) {
                                    show = false;
                                }
                            }
                            price = "Flatrate";
                            flatrates.push(item.offers[i].provider_id);
                        }
                        else if (item.offers[i].monetization_type == "buy") {
                            if (item.offers[i].presentation_type != "sd") {
                                show = false;
                            }
                            else {
                                price = "ab €" + item.offers[i].retail_price + " kaufen";
                            }
                            if (item.offers[i].provider_id == 130) {
                                show = true;
                                price = "€" + item.offers[i].retail_price;
                            }
                        }
                        else if (item.offers[i].monetization_type == "rent") {
                            if (item.offers[i].presentation_type != "sd") {
                                show = false;
                            }
                            else {
                                price = "ab €" + item.offers[i].retail_price;
                            }
                            if (item.offers[i].provider_id == 130) {
                                price = "€" + item.offers[i].retail_price;
                                show = true;
                            }
                        }
                        else {
                            show = false;
                        }

                        if(show && shouldBeShown(item.offers[i].provider_id)) {
                            if(even){
                                document.getElementById("detail-availability").innerHTML = document.getElementById("detail-availability").innerHTML + '<div class="detail-services-e"><img src="icons/'+ item.offers[i].provider_id +'.svg" class="detail-services-logo"><p class="detail-services-price" id="price-' + item.offers[i].provider_id + '">' + price + '</p></div>';
                                even = false;
                            }
                            else {
                                document.getElementById("detail-availability").innerHTML = document.getElementById("detail-availability").innerHTML + '<div class="detail-services-o"><img src="icons/'+ item.offers[i].provider_id +'.svg" class="detail-services-logo"><p class="detail-services-price" id="price-' + item.offers[i].provider_id + '">' + price + '</p></div>';
                                even = true;                                
                            }

                            shownBefore.push(item.offers[i].provider_id);

                            console.log("Added Service Number "+ item.offers[i].provider_id + " to the List");
                        }
                    }
                }
            }

            catch(e) {
                console.log("No offers found");
                console.log(e);
            }

            //Fill in Data
            document.getElementById("detail-title").innerHTML = title;
            document.getElementById("detail-year").innerHTML = year;
            document.getElementById("detail-description").innerHTML = description;
            document.getElementById("left").style.backgroundImage = "url(" + poster + ")";
            if (normalRating){
                document.getElementById("detail-rating").innerHTML = '<span class="detail-rating-real">'+ rating +'</span> / 10';
            }
            else {
                document.getElementById("detail-rating").innerHTML = rating;
            }
            document.getElementById("detail-min-age").innerHTML = minAge;
            document.getElementById("detail-runtime").innerHTML = runtime;
            //document.getElementById("detail-availability").innerHTML = services;

            navTo("result");
        }

        var codelist = {
            2: "iTunes",
            3: "Google Play",
            6: "Maxdome",
            8: "Netflix",
            9: "Amazon Prime Instant Video",
            10: "Amazon Instant Video",
            11: "Mubi",
            14: "realeyz",
            18: "Playstation",
            20: "Maxdome Store",
            28: "Netzkino",
            29: "Sky Go",
            30: "Sky Ticket",
            33: "alleskino",
            35: "Rakuten TV",
            40: "Chili (Cinema)",
            50: "Amazon (Store)",
            68: "Microsoft",
            89: "Kividoo",
            99: "Shudder",
            100: "GuideDoc",
            130: "Sky Store",
            133: "Video Buster",
            142: "Flimmit",
            171: "Watchbox",
            175: "Netflix Kids",
            178: "Entertain TV",
        }

        function codeToName(code) {
            return codelist[code]
        }

        var show = [2, 3, 6, 8, 9, 10, 18, 20, 29, 30, 35, 68, 89, 130, 171];

        function shouldBeShown(code) {
            for(var i = 0; i < show.length; i++){
                if(code == show[i]){
                    return true;
                }
            }
            return false;
        }

        var currentCursor1Location;

        function virtualCursor1Init() {
            try {
                document.getElementById("card-0").style.backgroundColor = "#0F3240";
                currentCursor1Location = 0;
            }
            catch(e){
                console.log(e);
            }
        }

        function virtualCursor1Move(direction) {
            if(direction == "up"){
                try {
                    if(currentCursor1Location != 0){
                        var currCard = "card-" + currentCursor1Location;
                        var nextLoc = currentCursor1Location - 1;
                        document.getElementById("card-" + nextLoc).style.backgroundColor = "#0F3240";
                        document.getElementById(currCard).style.backgroundColor = "rgba(0, 0, 0, 0.0)";
                        currentCursor1Location = currentCursor1Location - 1;
                    }
                    else {
                        console.log("Listenende oben erreicht!");
                    }
                }
                catch(e) {
                    console.warn(e);
                }
            }
            else if(direction == "down"){
                try {
                    if(currentCursor1Location != lastResult.total_results - 1){
                        var currCard = "card-" + currentCursor1Location;
                        var nextLoc = currentCursor1Location + 1;
                        document.getElementById("card-" + nextLoc).style.backgroundColor = "#0F3240";
                        document.getElementById(currCard).style.backgroundColor = "rgba(0, 0, 0, 0.0)";
                        currentCursor1Location = currentCursor1Location + 1;                        
                    }
                    else {
                        console.log("Listenende unten erreicht!");
                    }
                }
                catch(e) {
                    console.warn(e);
                }
            }
            else{
                console.warn("Unknown direction");
            }
        }
        
        document.addEventListener('keydown', function(e) {
        	if (currentLocation == "home") {
                switch(e.keyCode){
                    case 37: //LEFT arrow
                        break;
                    case 38: //UP arrow
                        break;
                    case 39: //RIGHT arrow
                        break;
                    case 40: //DOWN arrow
                        break;
                    case 13: //OK button
                        startSearch();
                        break;
                    case 10009: //RETURN button
                        tizen.application.getCurrentApplication().exit();
                        break;
                    case 65376: //Fertig button
                        startSearch();
                        break;
                    default:
                        console.log('Key code : ' + e.keyCode);
                        break;
                }
            }
            else if (currentLocation == "multiResults") {
                switch(e.keyCode){
                    case 37: //LEFT arrow
                        break;
                    case 38: //UP arrow
                        virtualCursor1Move("up");
                        break;
                    case 39: //RIGHT arrow
                        break;
                    case 40: //DOWN arrow
                        virtualCursor1Move("down");
                        break;
                    case 13: //OK button
                        showDetails(currentCursor1Location);
                        break;
                    case 10009: //RETURN button
                        navTo("home");
                        document.getElementById("query").focus();
                        break;
                    default:
                        console.log('Key code : ' + e.keyCode);
                        break;
                }
            }
            else if (currentLocation == "result") {
                switch(e.keyCode){
                    case 37: //LEFT arrow
                        break;
                    case 38: //UP arrow
                        break;
                    case 39: //RIGHT arrow
                        break;
                    case 40: //DOWN arrow
                        break;
                    case 13: //OK button
                        startSearch();
                        break;
                    case 10009: //RETURN button
                        navTo("multiResults");
                        break;
                    default:
                        console.log('Key code : ' + e.keyCode);
                        break;
                }
            }
        });