var exitedTileFrame = false;
document.addEventListener("mousemove",
    function(e) {
        if(DOBUKI.isMouseOver(DOBUKI.getObject('tile-frame'))) {
            if(exitedTileFrame) {
                DOBUKI.model.selected= null;
                exitedTileFrame = false;
                DOBUKI.getObject('ghost').active = false;
            }
        } else {
            if(!exitedTileFrame) {
                exitedTileFrame = true;
                if(DOBUKI.getObject('ghost')) {
                    DOBUKI.getObject('ghost').active = true;
                }
            }
        }
    });
    
document.addEventListener("mousedown",
    function(e) {
        var selectedTile = DOBUKI.model.selected;
        var ghost = DOBUKI.getObject('ghost');
        var x = ghost.tilepos.x;
        var y = ghost.tilepos.y;

        var mapObject = DOBUKI.model.map.objects.a(x,y);
        if(mapObject) {
            var index = DOBUKI.model.map.objects.indexOf(mapObject);
            DOBUKI.model.map.objects.splice(index,1);
            DOBUKI.model.selected = mapObject.tile;
        }
        
        if(selectedTile) {
            DOBUKI.model.map.objects.push(
                {
                    x:x,
                    y:y,
                    tile:selectedTile,
                }
            );
            DOBUKI.decodeObject(DOBUKI.model.map);
            if(!DOBUKI.model.input.keyboard.pressed[16]) {
                DOBUKI.model.selected=null;
            }
        }
        
        sortObjects();
        
        if(changedMap()) {
            storedMap = JSON.stringify(DOBUKI.model.map,null,2);
            beginSave();
        }
    }
);

function sortObjects() {
    DOBUKI.model.map.objects.sort(
        (a,b)=> b.y-a.y
    );
}

function changedMap() {
    return JSON.stringify(DOBUKI.model.map,null,2)!==storedMap;
}

function beginSave() {
    var data = new FormData();
    data.append('map', storedMap);

    DOBUKI.loadAsync("editor/savemap.php",
        function(result) {
            console.log(result);
        },
        false,
        "POST",
        data
    );
}

var storedMap = null;
DOBUKI.watchModel("map.id", 
    function() {
        if(DOBUKI.model.map.id==='map') {
            storedMap = JSON.stringify(DOBUKI.model.map,null,2);
        } 
    });
