<?php
    $res = array();
    $userId = $_COOKIE['idYa'];
    function getRKFiles($type, $ext,$userId)
    {

        $res = array();
        $filenameT = 'rk/'.$userId . '-'.$type.'_';
        $i = 0;
        do
        {
            $filename = $filenameT . $i .'.'. $ext;
            if(file_exists($filename))
            {
                $res[$i]['name'] = $filename;
                $res[$i]['lastTimeMod'] = date ("d.m.Y H:i:s", filemtime($filename));
            }
            $i++;
        }
        while(file_exists($filename));
        return $res;
    }

    function printFiles($files, $Title)
    {
        echo '<h2>'. $Title .'</h2>';
        for($i = 0;$i<count($files);$i++)
        {
            echo '<h3><a href="'. $files[$i]['name'].'">'. $files[$i]['lastTimeMod'] .'</a> </h3>';
        }
    }
?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Start5.BZ</title>
    <link rel="stylesheet" href="style_pc.css" type="text/css">
</head>
<body>
    <h1>Ваши рекламные кампании</h1>
    <div id="rk"><?php
                    $yaFiles = getRKFiles('ya', 'xls',$userId);
                    printFiles($yaFiles,'Yandex');
                    $yaFiles = getRKFiles('goo', 'csv',$userId);
                    printFiles($yaFiles,'Google');
                    $beFiles = getRKFiles('bee', 'csv',$userId);
                    printFiles($yaFiles,'Begun');
                 ?></div>
</body>
</html>