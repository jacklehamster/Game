<?php
    $map = $_REQUEST['map'];
    if($map) {
        file_put_contents(getcwd (  )."/../map.json", $map);
    }
?>