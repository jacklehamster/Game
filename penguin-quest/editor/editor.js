var storedMap = null;
function changedMap(map) {
    return JSON.stringify(map,null,2)!==storedMap;
}

function saveMap(map) {
    storedMap = JSON.stringify(map,null,2);
    var data = new FormData();
    data.append('map', storedMap);

    DOK.loadAsync("../editor/savemap.php",
        function(result) {
            console.log("Map saved");
            console.log(result);
        },
        false,
        "POST",
        data
    );
}

function checkMap(map) {
    if(changedMap(map)) {
        saveMap(map);
    }
}