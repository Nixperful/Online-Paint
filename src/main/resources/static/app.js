var app = (function () {

    class Point{
        constructor(x,y){
            this.x=x;
            this.y=y;
        }        
    }
    
    var stompClient = null;
    var canvas;
    var room;
    var addPointToCanvas = function (point) {    
        console.log(point);
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(point.x, point.y, 1, 0, 2 * Math.PI);
        ctx.stroke();
    };
    
    
    var getMousePosition = function (evt) {
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    };


    var connectAndSubscribe = function () {
        console.info('Connecting to WS...');
        var socket = new SockJS('/stompendpoint');
        stompClient = Stomp.over(socket);
        canvas = document.getElementById("canvas");
        room= document.getElementById("rooms").value;
        //subscribe to /topic/newpoint when connections succeed
        stompClient.connect({}, function (frame) {
            console.log('Connected: ' + frame);
            stompClient.subscribe('/topic/newpoint.'+room, function (event) {
                var coord=JSON.parse(event.body);
                console.log(coord);
                addPointToCanvas(coord);
            });
        });
     };
    

    return {

        init: function () {
            var can = document.getElementById("canvas");
            var ctx = can.getContext("2d");
            // Borramos el área que nos interesa
            ctx.clearRect(0, 0, can.width,can.height);
            //websocket connection
            connectAndSubscribe();
        },

        publishPoint: function(px,py){
            var pt=new Point(px,py);
            console.info("publishing point at "+ pt);
            addPointToCanvas(pt);

            //publicar el evento
            stompClient.send("/topic/newpoint."+room, {}, JSON.stringify(pt)); 
        },
        
        publishClickPoint: function(event){
            var pos=getMousePosition(event);
            var pt=new Point(pos.x,pos.y);
            console.info("publishing point at "+ pt);
            addPointToCanvas(pt);

            //publicar el evento
            stompClient.send("/topic/newpoint."+room, {}, JSON.stringify(pt));              
        },

        disconnect: function () {
            if (stompClient !== null) {
                stompClient.disconnect();
            }
            setConnected(false);
            console.log("Disconnected");
        }
    };

})();