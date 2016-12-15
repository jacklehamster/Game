// load a the user's image.
this.loadImageX = function (dataURL) {
    var image = new Image();
    
    image.onload = function () {
        renderer.loadImage2(image);
    }

    image.src = dataURL;
}