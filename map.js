var weatherMap= {
    weatherAPIKey: "63add1429b806857eb9cf34a85d92ff9", 
    map: null,
    initializeMap: function(){
        var currentLocation;
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                function (position) {
                    var latitude = position.coords.latitude;
                    var longitude = position.coords.longitude;
                    if (latitude && longitude) {
                        currentLocation = [latitude, longitude];
                        setMap();
                    }
                },
                function (error) {
                    currentLocation = [54, -110];
                    setMap();
                    console.log('Error getting geolocation', error);
                });
        }

        function setMap() {
                map = L.map('map', {
                    center: currentLocation,
                    zoom: 13
                });
                L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                }).addTo(map);
                
                var longPressTimeout;
                map.on('mousedown', function(e){
                    var pointLocation = {
                        lat : e.latlng.lat,
                        lng: e.latlng.lng
                    }
                    longPressTimeout = setTimeout(function(){
                        weatherMap.setWeatherPopUpData(pointLocation);
                    }, 1000);
                });

                map.on('dblclick', function(e){
                    var pointLocation = {
                        lat : e.latlng.lat,
                        lng: e.latlng.lng
                    };
                    weatherMap.setWeatherPopUpData(pointLocation);
                })

                map.on('mouseup, mousemove', function(){
                    if(longPressTimeout){
                        clearTimeout(longPressTimeout);
                    }
                });
        }
    },
    setWeatherPopUpData: function(pointLocation){
        var apiCall = `https://api.openweathermap.org/data/2.5/weather?lat=${pointLocation.lat}&lon=${pointLocation.lng}&appid=${this.weatherAPIKey}`;
        fetch(apiCall)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          weatherMap.initializeAndDisplayPopup(data);
        })
        .catch(error => {
          console.error('Error:', error);
        });
    },
    initializeAndDisplayPopup: function(weatherData){
        var weatherPopupContent = `<div class="container" style="width: 160px">
            <div class="row current-temp">
                <div class="col-6">
                    ${weatherMap.kelvinToCelius(weatherData.main.temp).toFixed(0)}
                    <span>&deg;</span>C 
                </div>
                <div class="col-6">
                    ${weatherData.weather.length > 0 ? weatherData.weather[0].main: ''}
                </div>
            </div>
            <hr/>
            <div class="row" style="text-align: center">
                <div class="col">
                    feels like ${weatherMap.kelvinToCelius(weatherData.main.feels_like).toFixed(0)}
                    <span>&deg;</span>C 
                </div>
            </div>
            <hr/>
            <div class="row">
                <div class="col-6">
                    L: ${weatherMap.kelvinToCelius(weatherData.main.temp_min).toFixed(0)}
                    <span>&deg;</span>C
                </div>
                <div class="col-6">
                    H: ${weatherMap.kelvinToCelius(weatherData.main.temp_max).toFixed(0)}
                    <span>&deg;</span>C
                </div>
            </div>
        </div>`; 
        L.marker([weatherData.coord.lat, weatherData.coord.lon]).addTo(map)
                            .bindPopup(weatherPopupContent)
                            .openPopup();
    },
    kelvinToCelius:function(tempInK){
        return tempInK - 273.15;
    }
    
}
