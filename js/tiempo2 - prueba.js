"use strict";
//------------Creación de variable----------------//

//appid de la aplicacion
var appid = "479092b77bcf850403cb2aeb1a302425";
//creo una variable con una url de localización fija
var urlAlcobendas = "https://api.openweathermap.org/data/2.5/forecast/daily?q=Alcobendas,es&lang=es&units=metric&mode=xml&appid=479092b77bcf850403cb2aeb1a302425";

//creo la variable donde voy a guardar la url completa con la información de la localización que nos va a dar el navegador
var urlWeather;
//variable global para guardar el xml
var xmlData;
//variable global donde guardaremos nuestro array de objetos y el numbre de la ciudad
var aInfo;

//-----------------Funciones----------------------//

async function init() {
    //llamo a la funcion que me va a dar la url de localizacion
    var location = await obtenerLocalizacion();
    //hace la peticion del xml y lo carga
    var xmlResult = await getDatosXML();
    //guardamos en el array aInfo la informacion obtenida en la funcion (ciudad, objetos tiempo)
    aInfo = informacionObj(xmlData);
    //imprimo el array
    imprimirApp(aInfo);
    
}
function obtenerLocalizacion () {
    console.log('Función obtenerLocalizacion');
    return new Promise(devolver => {
        /*navigator.geolocation html se utiliza para que el navegador obtenga la posicion geografica del usuario
        getCurrentPosition()método se utiliza para devolver la posición del usuario.
        Con esto recojo la localización del usuario y del objeto (position) recojo longitud y la latitud del objeto.
        La urlWeather lo meto dentro de la localización porque tiene que esperar a tener long y lat para generar la url válida.
        getCurrentPosition recibe dos parametros: el primero para si se permite la ubicacion y el segundo para cuando no se permita, donde metemos una url fija de Alcobendas.
        */
       
        navigator.geolocation.getCurrentPosition(function (position) {
            var long = position.coords.longitude;
            var lat = position.coords.latitude;
            urlWeather = "https://api.openweathermap.org/data/2.5/forecast/daily?lat=" + lat + "&lon=" + long + "&lang=es&units=metric&mode=xml&appid=" + appid;
            devolver(urlWeather);
        }, function() {
            urlWeather = urlAlcobendas;
            devolver(urlWeather);
        });
    });
}

function getDatosXML() {
    console.log('Funcion getDatosXML');
    return new Promise(function(carga, nocarga) {
        //hacemos la petición del xml
        var xhttp = new XMLHttpRequest();
        //creamos un escuchador de eventos que llama a la función manageResponse
        xhttp.addEventListener('readystatechange', function() {
            if (this.readyState == 4 && this.status == 200) {
                //guardo el xml en la variable global xmlData
                xmlData = this.responseXML;
                carga(xmlData); 
                //lo meto en el else if porque si no me salta al else todo el rato ya que va pasando por diferentes estados la llamada
            } else if(this.readyState == 4) {
                //en el catch devolvemos el mensaje 'Error al cargar XML!'
                nocarga('Error al cargar XML!');
            }
        });
        //abrimos la url
        xhttp.open("GET", urlWeather, true);
        //mandamos la peticion
        xhttp.send();
    });
}

function manageResponse(event) {
    if (this.readyState == 4 && this.status == 200) {
        crearObjetos(this); 
    }
};

//funcion que crea un objeto generico linea_xml guarda la informacion que necesitamos para crear el objeto Tiempo y despues con esa info creamos los objetos tiempo y los guardamos un array de objetos.
function informacionObj(xml) {
    //variable para guardar la hora siguiente mas cercana a nuestra conexion
    var hora_marca;
    //array donde voy a guardar el objeto generico con la info del objeto Tiempo.
    var aInfo = [];
    //devuelve un documento que contiene el HTML o XML recuperado por la solicitud, o nulo si la solicitud no fue exitosa.
    var xmlDoc = xml;
    //cogemos la etiqueta time
    var x = xmlDoc.getElementsByTagName("time");


    //recogemos el valor de la localidad y lo metemos en el array
    //aInfo[0]=xmlDoc.getElementsByTagName("name")[0];
    aInfo.push(xmlDoc.getElementsByTagName("name")[0].textContent);

    //recorremos time
    for(var i = 0; i < x.length ; i++){
        //objeto donde vamos a guardar la info
        var linea_xml = new Tiempo();
        //cogemos la etiqueta from y separamos el contenido en la T
        var fecha = x[i].getAttribute("day").split("T");
        
        
            //en el objeto guardamos la informacion en el array con diferentes indices.
           
            linea_xml.fecha = fecha[0];
            //guardamos el valor de var
            linea_xml.symbol = x[i].getElementsByTagName("symbol")[0].getAttribute("var");
            //creamos la url con el valor de var para que encuentre el icono del tiempo
            linea_xml.symbol = "http://openweathermap.org/img/w/" + linea_xml.symbol + ".png";
            linea_xml.windSpeed = x[i].getElementsByTagName("windSpeed")[0].getAttribute("mps") + ' m/s';
            linea_xml.temperature = x[i].getElementsByTagName("temperature")[0].getAttribute("day") + 'ºC';
            linea_xml.minima = parseFloat(x[i].getElementsByTagName("temperature")[0].getAttribute("min"));
            linea_xml.maxima = parseFloat(x[i].getElementsByTagName("temperature")[0].getAttribute("max"));
            linea_xml.humidity = x[i].getElementsByTagName("humidity")[0].getAttribute("value") + '%';
            linea_xml.windDirection  = x[i].getElementsByTagName("windDirection")[0].getAttribute("deg") + '%';
            linea_xml.pressure  = x[i].getElementsByTagName("pressure")[0].getAttribute("value") + '%';
            linea_xml.clouds = x[i].getElementsByTagName("clouds")[0].getAttribute("all") + '%';
            //creamos los objeto Tiempo con la informacion del objeto general y los guardamos en el array aInfo.
            aInfo.push(linea_xml); 
        
    }
    //devolvemos el array de objetos 
    return aInfo;
}

//Creo una variable con la funcion del constructor del objeto Tiempo
var Tiempo = function (fecha, temperature, minima, maxima, clouds, humidity, pressure, windSpeed, symbol) {
    this.fecha = fecha;
    this.temperature= temperature;
    this.minima= minima;
    this.maxima= maxima;
    this.clouds = clouds;
    this.humidity = humidity;
    this.pressure = pressure;
    this.windSpeed = windSpeed;
    this.symbol = symbol;   
}

//función imprimir

function imprimirApp(aInfo){
    console.log('Funcion imprimir');
    //caja es el contenedor principal que se va a imprimir en demo
    var cajaHTML = document.getElementById("demo");
    
    //donde voy a guardar "El tiempo en " + aInfo[0]
    var titulo = document.createElement("p");
    titulo.setAttribute("id", "titulo");
    //imprimo la información
    titulo.innerHTML = "El tiempo en <span>" + aInfo[0] + "</span>";
    ////se la agrego a la caja
    cajaHTML.appendChild(titulo);

    //creo un bucle para poder imprimir la informacion de los tiempos
    for(var i = 1; i < aInfo.length; i++) {
        //div que va a contener textoTiempo(fecha, hora e icono) y cajaInfo
        var contentDia = document.createElement("div");
        //textoTiempo(fecha, hora e icono)
        var textoDia = document.createElement("p");
        var cajaInfo = document.createElement("div");
        
        
        //le añado la clase masInfo para darle el none con css
        cajaInfo.setAttribute("class", "masInfo");
        contentDia.classList.add('contentDia');
        textoDia.setAttribute("class", "textoDia");
        //añadimos un atributo a la p textoDia con valor de i
        
        //dia de la semana
        var dias=["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
        var fechaJ = aInfo[i].fecha.split("-");
        var dt = new Date (fechaJ[1]+' '+fechaJ[2]+', '+fechaJ[0]+' 12:00:00');
        
        //me guardo en info dia de la semana, la fecha y la hora
        var info = dias[dt.getUTCDay()] + "// ";
        
        info += " Fecha: " + aInfo[i].fecha + "// ";  
        info += '  ' + Math.round(aInfo[i].minima) + 'º/';
        info += Math.round(aInfo[i].maxima) + 'º';
        
        //me creo un elemento para imprimir el icono como src
        var img = document.createElement("img");
        img.setAttribute("src", aInfo[i].symbol);

        textoDia.innerHTML= info;
        
//------------------------------------------------------------------
        
        //añado un evento escuchador para la funcion click
        textoDia.addEventListener("click", function() {
            var content = this.parentElement;         
            //me guardo la clase que tiene el elemento al pulsarlo
            var tieneClase = content.getAttribute('class');
            //recorro todo el array de objetos y quito la clase activo
            var each = document.getElementsByClassName("contentDia");
            for(var i = 0; i < each.length; i++) {
                each[i].classList.remove("activo"); 
            }         
            //si el textoTiempo que he pulsado antes no tiene class active lo activo.       
            if(tieneClase != "activo") {
                content.classList.add("activo");       
            }
        });

//---------------------------------------------------------------------
        
        //añado la img del icono a textoTiempo para que salga con fecha y hora.
        textoDia.appendChild(img);
        //añado el textoTiempo a contentTime
        contentDia.appendChild(textoDia);
        //guardo en la variable info la informacion de caja info
        info = 'Temperatura: ' + aInfo[i].temperature + '<br>';   
        info += 'Nubes: ' + aInfo[i].clouds + '<br>';
        info += 'Humedad: ' + aInfo[i].humidity + '<br>';
        info += 'Presión: ' + aInfo[i].pressure + '<br>';
        info += 'Viento: ' + aInfo[i].windSpeed + '<br>';
        //añado la info a cajainfo
        cajaInfo.innerHTML= info;
        //añado cajainfo a contentTime
        contentDia.appendChild(cajaInfo);
        //añado el contentTime a la caja
        cajaHTML.appendChild(contentDia);       
    } 

}

window.onload = function(){
    init();
};