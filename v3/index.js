window.onload = function () {
    function draw() {

        var i = new Image();
        // i.src = "data:image/svg+xml,<svg width=\"50\" height=\"40\" id=\"art\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 360 200\"><defs><style>.cls-1{fill:none;stroke:red;stroke-miterlimit:10;stroke-width:2px;}</style></defs><title>r-swell-tesselation-pattern</title><polyline class=\"cls-1\" points=\"280 -20 260 0 100 0 0 100 80 100 200 220 240 220 360 100 280 100 180.01 0\"/><polyline class=\"cls-1\" points=\"0 300 100 200 260 200 380 80\"/></svg>";
        i.src = "data:image/svg+xml,<svg version=\"1.1\" id=\"art\" width='200' xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\"\n" +
            "\t viewBox=\"0 0 360 200\" style=\"enable-background:new 0 0 360 200;\" xml:space=\"preserve\">\n" +
            "<style type=\"text/css\">\n" +
            "\t.st0{fill:none;stroke:#FF0000;stroke-width:2;stroke-miterlimit:10;}\n" +
            "</style>\n" +
            "<title>r-swell-tesselation-pattern</title>\n" +
            "<polyline class=\"st0\" points=\"280,-20 260,0 100,0 0,100 80,100 200,220 240,220 360,100 280,100 180,0 \"/>\n" +
            "</svg>\n";
        i.onload = function () {
            let canvas = document.getElementById('container');
            let ctx = canvas.getContext('2d');
            // let gradient = ctx.createLinearGradient(0,0,170,0);
            // gradient.addColorStop(0, 'black');
            // gradient.addColorStop(1, 'white');

            // ctx.fillStyle="linear-gradient(red, yellow)";


            for (w = 0; w <= 1000; w += 20) {
                for (h = 0; h <= 1000; h += 20) {
                    ctx.fillRect(w, h, 2, 2);
                }
            }

            console.log(i);
            var pattern = ctx.createPattern(i, "repeat");
            ctx.fillStyle = pattern;
            ctx.translate(0, 0);
            ctx.fillRect(0, 0, 1000, 1000);

        }

    }

    draw();

};