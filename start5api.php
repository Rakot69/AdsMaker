<?php
    ini_set(‘memory_limit’, ’128M’);
    include_once 'PHPExcel.php';
    include_once 'robokassa.class.php';
    include_once 'yaapi.php';
    include_once 'PHPExcel/Writer/CSV.php';
    require_once 'PHPExcel/IOFactory.php';
    include 'PHPExcel/Writer/Excel2007.php';
    $post = $_POST;
    if (isset($post['method'])) {
        if($post['method'] == 'GetUserState')
            GetUserState();
        if($post['method'] == 'SaveRK')
            GetRKInfo();
        if($post['method'] == 'UploadYaRK')
            UploadYaRK();
        if($post['method'] == 'UploadRKFile')
            UploadRKFile();
    }
    function UploadYaRK()
    {
        $objPHPExcel = PHPExcel_IOFactory::load($_FILES['rkfile']['tmp_name']);
        $objPHPExcel->setActiveSheetIndex(0);
        $rowc = $objPHPExcel->getActiveSheet()->getHighestRow();
        $globKW = $objPHPExcel->getActiveSheet()->getCellByColumnAndRow(4,7)->getValue();
        $yark = array();
        $yark['glKW'] = $globKW;
        $anns = array();
        for($i = 10;$i <=$rowc; $i++)
        {
            $ann = array();
            $ann['keywords'] = $objPHPExcel->getActiveSheet()->getCellByColumnAndRow(2 , $i)->getValue();
            $ann['yaheader'] = $objPHPExcel->getActiveSheet()->getCellByColumnAndRow(4 , $i)->getValue();
            $ann['yatext'] = $objPHPExcel->getActiveSheet()->getCellByColumnAndRow(5 , $i)->getValue();
            $ann['yaurl'] = $objPHPExcel->getActiveSheet()->getCellByColumnAndRow(8 , $i)->getValue();
            $ann['region'] = $objPHPExcel->getActiveSheet()->getCellByColumnAndRow(9 , $i)->getValue();
            $ann['yabet'] = '1';//$objPHPExcel->getActiveSheet()->getCellByColumnAndRow(10 , $i)->getValue();
            $ann['yabetNet'] = $objPHPExcel->getActiveSheet()->getCellByColumnAndRow(11 , $i)->getValue();
            $anns[$i-10] = $ann;
        }
        $yark['anns'] = $anns;
        echo (json_encode($yark));
    }
    function UploadRKFile()
    {
        $objPHPExcel = PHPExcel_IOFactory::load($_FILES['rkfile']['tmp_name']);
        $objPHPExcel->setActiveSheetIndex(0);
        $rowc = $objPHPExcel->getActiveSheet()->getHighestRow();
        $yark = array();
        $anns = array();
        for($i = 1;$i <=$rowc; $i++){
            $ann = array();
            $ann['keywords'] = $objPHPExcel->getActiveSheet()->getCellByColumnAndRow(0 , $i)->getValue();
            $anns[$i-1] = $ann;}
        $yark['anns'] = $anns;
        echo (json_encode($yark));}


    function robokassaInit($sum, $userId, $rkType, $a_aid){
        $kassa = new Robokassa('Start5.bz', 'Du4a9D0UxX', 'NnVmitw3d2');

        /* назначение параметров */
        $kassa->OutSum       = $sum;
        //$kassa->IncCurrLabel = 'WMRM';
        //$kassa->Desc         = 'Тестовая оплата';

        $kassa->addCustomValues(array(
            'shp_user' => $userId, // все ключи массива должны быть с префиксом shp_
            'shp_someData' => 'someValue',
            'shp_rkType' => $rkType,
            'shp_a_aid' => $a_aid
        ));

        /* редирект на сайт робокассы */

        return $kassa->getRedirectURL();
    }
    function GetRKInfo(){
        $res =  array();
        $rkInfo = $_POST['rkInfo'];
        GetUserInfo();
        $userId = $_SESSION['idYa'];
        $a_aid = $_POST['a_aid'];
        // так можно проверить содержание - var_dump($rkInfo);
        // сохранить состояние
        SaveUserState($userId, $rkInfo, $rkType);
        $billYa = calculateBill(count($rkInfo['rkAnnounces']),'ya');
        $billGo = calculateBill(count($rkInfo['rkAnnounces']),'goo');
        $billBe = calculateBill(count($rkInfo['rkAnnounces']),'be');
        $res['robokassaUrlYa'] = robokassaInit($billYa,$userId, 'ya', $a_aid);
        $res['robokassaUrlGo'] = robokassaInit($billGo,$userId, 'goo', $a_aid);
        $res['robokassaUrlBe'] = robokassaInit($billBe,$userId, 'be', $a_aid);
        $res['billYa'] = $billYa;
        $res['billGo'] = $billGo;
        $res['billBe'] = $billBe;
        
            GenerateRK($_POST['rkInfo'], $userId, 'ya');
            GenerateRK($_POST['rkInfo'], $userId, 'goo');
            GenerateRK($_POST['rkInfo'], $userId, 'be');

        echo json_encode($res);
    }
    function GenerateRK($rkInfo, $userId, $rkType)
    {
        $res =  array();
        $rkAnnounces = SplitArray($rkInfo['rkAnnounces'], 500);
        $time = 0;
        for($i = 0;$i<count($rkInfo['rkCompanies']);$i++)
        {
            $curCompany = $rkInfo['rkCompanies'][$i];
            if ($curCompany['rkType'] == $rkType )
            {
                $objWriter = null;
                for($v = 0; $v < count($rkAnnounces); $v++)
                {
                    $rkInfo['rkAnnounces'] = $rkAnnounces[$v];


                    $objPHPExcel = SetRkData($objWriter, $curCompany, $rkInfo);
                    $res['rk'][$time] = WriteRKFile($curCompany, $objPHPExcel, $userId, $v);
                    $time++;
                }
            }
        }
    }
    function DetectNewFileIndex($userId, $type, $fileFormat)
    {
        $i = 0;
        do
        {
            $name = 'rk/'. $userId . '-' . $type .'_'. $i .'.'. $fileFormat;
            $i++;
        }
        while(file_exists($name));
        $i--;
        return $i;
    }
    function calculateBill($amount, $rkType)
    {
        $multi = 1;
        if($rkType == 'ya')
            $multi = 1;
        if( $rkType == 'goo' )
            $multi = 0.75;
        if( $rkType == 'be' )
            $multi = 0.5;
        return $amount * $multi;
    }
    function WriteRKFile($curRkCompany, $objPHPExcel, $userId, $v){
        $rkCompanies = $rkInfo['rkCompanies'];
        if($curRkCompany['fileFormat'] == 'xls'){
            $objWriter = new PHPExcel_Writer_Excel5($objPHPExcel);}
        if($curRkCompany['fileFormat'] == 'csv')        {
            $objWriter = new PHPExcel_Writer_CSV($objPHPExcel);
            $objWriter->setDelimiter(";");
            $objWriter->setEnclosure( '' );
            $objWriter->setUseBOM( true);
            $objWriter->setSheetIndex(0);
            $objWriter->setLineEnding("\r\n");}
        $index = DetectNewFileIndex($userId, $curRkCompany['rkType'], $curRkCompany['fileFormat']);
        $name = 'rk/'. $userId . '-' . $curRkCompany['rkType'] .'_'. $index .'.'. $curRkCompany['fileFormat'];
        $objWriter->save($name);
        unset($objWriter);
        return $name;
    }
    function SplitArray($ar, $size)    {
        $r = array();
        $arLength = count($ar);
        $offset = 0;
        for($i = 0;$offset <= $arLength;)        {
            $r[$i] = array_slice($ar, $offset, $size);
            $i++;
            $offset =$i*$size;        }
        // остаток
        $rest = $arLength - $offset;
        // если что-то осталось
        if( $rest > 0 )
            // заносим оставшиеся элементы массива в радужный массив
            $r[$i++] = array_slice($ar, $offset, $rest);
        // вернуть общее
        return $r;
        }
    function GetUserState()    {
        GetUserInfo();
        $userId = $_COOKIE['idYa'];


        $state = LoadUserState($userId);
        echo json_encode($state);    }
    function GetUserStateFileName($userId)    {
        return 'rk/'.$userId.'.json';    }
    function LoadUserState($userId)    {
        $file = GetUserStateFileName($userId);
        if(file_exists($file))
        {
            $json = json_decode(file_get_contents($file), true);
            return $json;
        }
        else
        {
            $json = json_decode('{}', true);
            return $json;
        }

    }
    function SaveUserState($userId, $rkInfo)
    {
        $usFileName = GetUserStateFileName($userId);;
        $fp = fopen($usFileName, 'w');
        $rkInfo['default_email'] = $_COOKIE['default_email'];
        fwrite($fp, json_encode($rkInfo));
        fclose($fp);
    }
    function SetRuleCommand($AlphaPos, $time, $value)
    {
        $objPHPExcel->getActiveSheet()->SetCellValue($AlphaPos . $time, $name);
    }
    function SetRkData($objPHPExcel,$curRkCompany, $rkData)
    {
        $rkType = $curRkCompany['rkType'];
        $filename = "rkTemples/". $rkType ."Templ.xls";
        $rkAnnounces = $rkData['rkAnnounces'];
        $rkcClear = count($rkAnnounces);
        if($rkData['useTranslate'] != 'false')
        {
            for($i = 0;$i < $rkcClear;$i++)
            {
                $rkAnnounces[$rkcClear+$i] = $rkAnnounces[$i];
                $rkAnnounces[$rkcClear+$i]['keywords'] = transliterate($rkAnnounces[$rkcClear+$i]['keywords']);
            }

        }
        $rkc = count($rkAnnounces);
        if($rkData['useCorrect'] != 'false')
        {
            for($i = 0;$i < $rkcClear;$i++)
            {
                $rkAnnounces[$rkc+$i] = $rkAnnounces[$i];
                $rkAnnounces[$rkc+$i]['keywords'] =  switcher($rkAnnounces[$rkc+$i]['keywords'],0);
            }
        }
        $rkData['rkAnnounces'] = $rkAnnounces;
        if( $rkType == 'ya' ){
            $objPHPExcel = PHPExcel_IOFactory::load($filename);
            SetYandexRkData($objPHPExcel, $rkData, $curRkCompany['regionYandex']);
        }
        if( $rkType == 'goo' ){
            $objPHPExcel = new PHPExcel();//$objReader->load($filename);
            SetGoogleRkData($objPHPExcel, $rkData['rkName'], $rkData, $curRkCompany['regionGoogle']);
        }
        if( $rkType == 'be' ){
            $objPHPExcel = new PHPExcel();
            SetBegunRkData($objPHPExcel, $rkData);
        }
        SetProp($objPHPExcel, $rkData);

        return $objPHPExcel;
    }

    function SetProp($objPHPExcel,$rkInfo)
    {
        // Set properties
        $objPHPExcel->getProperties()->setCreator("START5 - 2014");
        $objPHPExcel->getProperties()->setLastModifiedBy("Excel Robot");
        $objPHPExcel->getProperties()->setTitle($rkInfo['rkTitle']);
        $objPHPExcel->getProperties()->setSubject($rkInfo['rkSubject']);
        $objPHPExcel->getProperties()->setDescription($rkInfo['rkDescription']);

    }

    function transliterate($str)
    {
        $translit = array(
            "А"=>"A","Б"=>"B","В"=>"V","Г"=>"G",
            "Д"=>"D","Е"=>"E","Ж"=>"J","З"=>"Z","И"=>"I",
            "Й"=>"Y","К"=>"K","Л"=>"L","М"=>"M","Н"=>"N",
            "О"=>"O","П"=>"P","Р"=>"R","С"=>"S","Т"=>"T",
            "У"=>"U","Ф"=>"F","Х"=>"H","Ц"=>"TS","Ч"=>"CH",
            "Ш"=>"SH","Щ"=>"SCH","Ъ"=>"","Ы"=>"YI","Ь"=>"",
            "Э"=>"E","Ю"=>"YU","Я"=>"YA","а"=>"a","б"=>"b",
            "в"=>"v","г"=>"g","д"=>"d","е"=>"e","ж"=>"j",
            "з"=>"z","и"=>"i","й"=>"y","к"=>"k","л"=>"l",
            "м"=>"m","н"=>"n","о"=>"o","п"=>"p","р"=>"r",
            "с"=>"s","т"=>"t","у"=>"u","ф"=>"f","х"=>"h",
            "ц"=>"ts","ч"=>"ch","ш"=>"sh","щ"=>"sch","ъ"=>"y",
            "ы"=>"yi","ь"=>"","э"=>"e","ю"=>"yu","я"=>"ya"
        );
         $res = strtr($str,$translit);

         return $res;
    }

    function switcher($text,$arrow=0){
        $str[0] = array('й' => 'q', 'ц' => 'w', 'у' => 'e', 'к' => 'r', 'е' => 't', 'н' => 'y', 'г' => 'u', 'ш' => 'i', 'щ' => 'o', 'з' => 'p', 'х' => "[", 'ъ' => ']', 'ф' => 'a', 'ы' => 's', 'в' => 'd', 'а' => 'f', 'п' => 'g', 'р' => 'h', 'о' => 'j', 'л' => 'k', 'д' => 'l', 'ж' => ';', 'э' => '\'', 'я' => 'z', 'ч' => 'x', 'с' => 'c', 'м' => 'v', 'и' => 'b', 'т' => 'n', 'ь' => 'm', 'б' => ',', 'ю' => '.', 'Й' => 'Q', 'Ц' => 'W', 'У' => 'E', 'К' => 'R', 'Е' => 'T', 'Н' => 'Y', 'Г' => 'U', 'Ш' => 'I', 'Щ' => 'O', 'З' => 'P', 'Х' => '}', 'Ъ' => '}', 'Ф' => 'A', 'Ы' => 'S', 'В' => 'D', 'А' => 'F', 'П' => 'G', 'Р' => 'H', 'О' => 'J', 'Л' => 'K', 'Д' => 'L', 'Ж' => ':', 'Э' => '"', '?' => 'Z', 'ч' => 'X', 'С' => 'C', 'М' => 'V', 'И' => 'B', 'Т' => 'N', 'Ь' => 'M', 'Б' => '<', 'Ю' => '.',);
        $str[1] = array (  'q' => 'й', 'w' => 'ц', 'e' => 'у', 'r' => 'к', 't' => 'е', 'y' => 'н', 'u' => 'г', 'i' => 'ш', 'o' => 'щ', 'p' => 'з', "[" => 'х', ']' => 'ъ', 'a' => 'ф', 's' => 'ы', 'd' => 'в', 'f' => 'а', 'g' => 'п', 'h' => 'р', 'j' => 'о', 'k' => 'л', 'l' => 'д', ';' => 'ж', '\'' => 'э', 'z' => 'я', 'x' => 'ч', 'c' => 'с', 'v' => 'м', 'b' => 'и', 'n' => 'т', 'm' => 'ь', ',' => 'б', '.' => 'ю', 'Q' => 'Й', 'W' => 'Ц', 'E' => 'У', 'R' => 'К', 'T' => 'Е', 'Y' => 'Н', 'U' => 'Г', 'I' => 'Ш', 'O' => 'Щ', 'P' => 'З', '{' => 'Х', '}' => 'Ъ', 'A' => 'Ф', 'S' => 'Ы', 'D' => 'В', 'F' => 'А', 'G' => 'П', 'H' => 'Р', 'J' => 'О', 'K' => 'Л', 'L' => 'Д', ':' => 'Ж', '"' => 'Э', 'Z' => '?', 'X' => 'ч', 'C' => 'С', 'V' => 'М', 'B' => 'И', 'N' => 'Т', 'M' => 'Ь', '<' => 'Б', '.' => 'Ю', );
        return strtr($text,isset( $str[$arrow] )? $str[$arrow] :array_merge($str[0],$str[1]));
    }


    function SetYandexAnnounce($objPHPExcel, $cell, $announce, $keywords, $region)
    {
        $objPHPExcel->setActiveSheetIndex(0);
        $keywords = $keywords;
        $minuswordsCellStr = '';
        if(isset($announce['minuswords']))
        {
            $minuswords = $announce['minuswords'];
            $minuswordsCellStr = '';
            for($y = 0;$y < count($minuswords);$y++)
            {
                $minuswordsCellStr = $minuswordsCellStr.' -' . $minuswords[$y];
            }
        }
        if(strlen($minuswordsCellStr) < 4096)
        {
            $keywords = $keywords . $minuswordsCellStr;
            if(!isset($announce['minuswords']))
            {
                $keywords = '"'.$keywords.'"';
            }
        }
        else
        {
            $val = $objPHPExcel->getActiveSheet()->getCellByColumnAndRow(4, $row)->getValue().$minuswordsCellStr;
            $objPHPExcel->getActiveSheet()->SetCellValue('e7', $val);
        }

        $objPHPExcel->getActiveSheet()->SetCellValue('c' . $cell, $keywords, $region);
	$objPHPExcel->getActiveSheet()->SetCellValue('a' . $cell, $cell);
        //$objPHPExcel->getActiveSheet()->SetCellValue('a' . $cell, $announce['yaheader']);
        $objPHPExcel->getActiveSheet()->SetCellValue('e' . $cell, $announce['yaheader']);
        $objPHPExcel->getActiveSheet()->SetCellValue('f' . $cell, $announce['yatext']);
        $objPHPExcel->getActiveSheet()->SetCellValue('i' . $cell, $announce['yaurl']);
        $objPHPExcel->getActiveSheet()->SetCellValue('j' . $cell, $region);
        $objPHPExcel->getActiveSheet()->SetCellValue('k' . $cell, $announce['yabet']);
        $objPHPExcel->getActiveSheet()->SetCellValue('l' . $cell, $announce['yabetNet']);
	if($rkData['viz']['country'] == '')
	        $objPHPExcel->getActiveSheet()->SetCellValue('m' . $cell, '');
	else
        	$objPHPExcel->getActiveSheet()->SetCellValue('m' . $cell, '+');
    }
    function SetYandexRkData($objPHPExcel, $rkData, $region)
    {
        $rkAnnounces = $rkData['rkAnnounces'];
        $time = 10;
        for($i = 0;$i < count($rkAnnounces);$i++)
        {
            $announce = $rkAnnounces[$i];
            SetYandexAnnounce($objPHPExcel, $time, $announce, $announce['keywords'], $region);
            $time++;
        }

        $objPHPExcel->setActiveSheetIndex(1);
        $objPHPExcel->getActiveSheet()->SetCellValue('c' . 9, $rkData['viz']['country']);
        $objPHPExcel->getActiveSheet()->SetCellValue('c' . 11, $rkData['viz']['city']);
        $objPHPExcel->getActiveSheet()->SetCellValue('c' . 13, $rkData['viz']['codeCountry']);
        $objPHPExcel->getActiveSheet()->SetCellValue('d' . 13, $rkData['viz']['codeCity']);
        $objPHPExcel->getActiveSheet()->SetCellValue('e' . 13, $rkData['viz']['codeTelephone']);
        $objPHPExcel->getActiveSheet()->SetCellValue('f' . 13, $rkData['viz']['codeAdd']);
        $objPHPExcel->getActiveSheet()->SetCellValue('i' . 13, $rkData['viz']['OGRP']);
        $objPHPExcel->getActiveSheet()->SetCellValue('b' . 17, $rkData['viz']['companyNameFIO']);
        $objPHPExcel->getActiveSheet()->SetCellValue('b' . 20, $rkData['viz']['contactFace']);
        $objPHPExcel->getActiveSheet()->SetCellValue('b' . 23, $rkData['viz']['costStreet']);
        $objPHPExcel->getActiveSheet()->SetCellValue('d' . 23, $rkData['viz']['postDom']);
        $objPHPExcel->getActiveSheet()->SetCellValue('e' . 23, $rkData['viz']['postCorpus']);
        $objPHPExcel->getActiveSheet()->SetCellValue('f' . 23, $rkData['viz']['postOffice']);
        $objPHPExcel->getActiveSheet()->SetCellValue('b' . 27, $rkData['viz']['wordDS1']);
        $objPHPExcel->getActiveSheet()->SetCellValue('c' . 27, $rkData['viz']['wordDE1']);
        $objPHPExcel->getActiveSheet()->SetCellValue('e' . 27, $rkData['viz']['wordHS1']);
        $objPHPExcel->getActiveSheet()->SetCellValue('f' . 27, $rkData['viz']['wordHE1']);
        $objPHPExcel->getActiveSheet()->SetCellValue('b' . 28, $rkData['viz']['wordDS2']);
        $objPHPExcel->getActiveSheet()->SetCellValue('c' . 28, $rkData['viz']['wordDE2']);
        $objPHPExcel->getActiveSheet()->SetCellValue('e' . 28, $rkData['viz']['wordHS2']);
        $objPHPExcel->getActiveSheet()->SetCellValue('f' . 28, $rkData['viz']['wordHE2']);
        $objPHPExcel->getActiveSheet()->SetCellValue('b' . 29, $rkData['viz']['wordDS3']);
        $objPHPExcel->getActiveSheet()->SetCellValue('c' . 29, $rkData['viz']['wordDE3']);
        $objPHPExcel->getActiveSheet()->SetCellValue('e' . 29, $rkData['viz']['wordHS3']);
        $objPHPExcel->getActiveSheet()->SetCellValue('f' . 29, $rkData['viz']['wordHE3']);
        $objPHPExcel->getActiveSheet()->SetCellValue('i' . 17, $rkData['viz']['email']);
        $objPHPExcel->getActiveSheet()->SetCellValue('i' . 20, $rkData['viz']['inetPagerType']);
        $objPHPExcel->getActiveSheet()->SetCellValue('k' . 20, $rkData['viz']['inetPagerLogin']);
        $objPHPExcel->getActiveSheet()->SetCellValue('i' . 23, $rkData['viz']['GoodInfo']);
        $objPHPExcel->setActiveSheetIndex(0);


    }

    function SetGoogleRkData($objPHPExcel,$rkName,$rkData, $googleRegion)
    {

        $rkAnnounces = $rkData['rkAnnounces'];
        $time = 1;

        SetGoogleHeader($objPHPExcel);


        $time++;
        GiveGoogleCommand($objPHPExcel, $rkName, 'b', $time, 300);
        GiveGoogleCommand($objPHPExcel, $rkName,'c', $time, 'Google Search;Search Partners;Display');
        GiveGoogleCommand($objPHPExcel, $rkName,'d', $time, 'en;ru');
        GiveGoogleCommand($objPHPExcel, $rkName,'d', $time, 'en;ru');

        for($a = 0;$a<count($googleRegion);$a++)
        {
            $region = $googleRegion[$a];
            $time++;
            GiveGoogleCommand($objPHPExcel, $rkName, 'f', $time, $region);
        }
        //echo ' _O/ '.count($rkAnnounces);
        for($i = 0;$i < count($rkAnnounces);$i++)
        {
            //echo ' _O/'.$i;
            $announce = $rkAnnounces[$i];
            $name =  $announce['keywords'];
            $time++;
            GiveGoogleAnnounceCommand($objPHPExcel, $rkName, $name, 'l', $time, 'None');
            GiveGoogleAnnounceCommand($objPHPExcel, $rkName, $name, 'm', $time, 'Interests and remarketing');
            GiveGoogleAnnounceCommand($objPHPExcel, $rkName, $name, 'h', $time, $announce['gobet']);
            GiveGoogleAnnounceCommand($objPHPExcel, $rkName, $name, 'i', $time, $announce['gobetNet']);
            $time++;
            GiveGoogleAnnounceCommand($objPHPExcel, $rkName, $name, 'x', $time, $announce['goheader']);
            GiveGoogleAnnounceCommand($objPHPExcel, $rkName, $name, 'y', $time, $announce['gotext']);
            GiveGoogleAnnounceCommand($objPHPExcel, $rkName, $name, 'z', $time, $announce['gotext2']);
            GiveGoogleAnnounceCommand($objPHPExcel, $rkName, $name, 'aa', $time, $announce['gourl']);
            GiveGoogleAnnounceCommand($objPHPExcel, $rkName, $name, 'ab', $time, $announce['gourl']);
            GiveGoogleAnnounceCommand($objPHPExcel, $rkName, $name, 'ac', $time, 'All');
            GiveGoogleAnnounceCommand($objPHPExcel, $rkName, $name, 'ai', $time, 'Active');
            GiveGoogleAnnounceCommand($objPHPExcel, $rkName, $name, 'aj', $time, 'Pending Review');
            $time++;
            GiveGoogleAnnounceCommand($objPHPExcel, $rkName, $name, 'n', $time, $announce['keywords']);
            GiveGoogleAnnounceCommand($objPHPExcel, $rkName, $name, 's', $time, 'Broad');
            GiveGoogleAnnounceCommand($objPHPExcel, $rkName, $name, 'ab', $time, $announce['gourl']);
            GiveGoogleAnnounceCommand($objPHPExcel, $rkName, $name, 'ai', $time, 'Active');
            GiveGoogleAnnounceCommand($objPHPExcel, $rkName, $name, 'aj', $time, 'Pending Review');
            if(isset($announce['minuswords']))
            for($nw = 0;$nw<count($announce['minuswords']);$nw++)
            {

                $time++;
                GiveGoogleAnnounceCommand($objPHPExcel, $rkName, $name, 'n', $time, $announce['minuswords'][$nw]);
                GiveGoogleAnnounceCommand($objPHPExcel, $rkName, $name, 's', $time, 'Negative Broad');
                GiveGoogleAnnounceCommand($objPHPExcel, $rkName, $name, 'ab', $time, $announce['gourl']);
                GiveGoogleAnnounceCommand($objPHPExcel, $rkName, $name, 'ai', $time, 'Active');
                GiveGoogleAnnounceCommand($objPHPExcel, $rkName, $name, 'aj', $time, 'Pending Review');

            }
            $time++;
            GiveGoogleAnnounceCommand($objPHPExcel, $rkName, $name, 'o', $time, $announce['gourl']);
            GiveGoogleAnnounceCommand($objPHPExcel, $rkName, $name, 'ab', $time, $announce['gourl']);
            GiveGoogleAnnounceCommand($objPHPExcel, $rkName, $name, 'ai', $time, 'Active');
            /*for($au=0;$au<$announce['audiences'];$au++)
            {
                $time++;
                GiveGoogleAnnounceCommand($objPHPExcel, $rkName, $name, 'p', $time, $announce['audiences'][$au]);
                GiveGoogleAnnounceCommand($objPHPExcel, $rkName, $name, 'ai', $time, 'Active');
            }*/
            /*for($age=0;$age<count($announce['age']);$age++)
            {
                $time++;
                GiveGoogleAnnounceCommand($objPHPExcel, $rkName, $name, 'r', $time, $announce['age'][$age]);
                GiveGoogleAnnounceCommand($objPHPExcel, $rkName, $name, 'ai', $time, 'Active');
            }*/
        }
       // echo ' _O/ Done';

    }

    function SetGoogleHeader($objPHPExcel)
    {
        $time = 1;
        $objPHPExcel->getActiveSheet()->SetCellValue('a' . $time, 'Campaign');
        $objPHPExcel->getActiveSheet()->SetCellValue('b' . $time, 'Campaign Daily Budget');
        $objPHPExcel->getActiveSheet()->SetCellValue('c' . $time, 'Networks');
        $objPHPExcel->getActiveSheet()->SetCellValue('d' . $time, 'Languages');
        $objPHPExcel->getActiveSheet()->SetCellValue('e' . $time, 'ID');
        $objPHPExcel->getActiveSheet()->SetCellValue('f' . $time, 'Location');
        $objPHPExcel->getActiveSheet()->SetCellValue('g' . $time, 'Ad Group');
        $objPHPExcel->getActiveSheet()->SetCellValue('h' . $time, 'Max CPC');
        $objPHPExcel->getActiveSheet()->SetCellValue('i' . $time, 'Display Network Max CPC');
        $objPHPExcel->getActiveSheet()->SetCellValue('j' . $time, 'Max CPM');
        $objPHPExcel->getActiveSheet()->SetCellValue('k' . $time, 'CPA Bid');
        $objPHPExcel->getActiveSheet()->SetCellValue('l' . $time, 'Display Network Custom Bid Type');
        $objPHPExcel->getActiveSheet()->SetCellValue('m' . $time, 'Flexible Reach');
        $objPHPExcel->getActiveSheet()->SetCellValue('n' . $time, 'Keyword');
        $objPHPExcel->getActiveSheet()->SetCellValue('o' . $time, 'Website');
        $objPHPExcel->getActiveSheet()->SetCellValue('p' . $time, 'Audience');
        $objPHPExcel->getActiveSheet()->SetCellValue('q' . $time, 'Gender');
        $objPHPExcel->getActiveSheet()->SetCellValue('r' . $time, 'Age');
        $objPHPExcel->getActiveSheet()->SetCellValue('s' . $time, 'Criterion Type');
        $objPHPExcel->getActiveSheet()->SetCellValue('t' . $time, 'First Page CPC');
        $objPHPExcel->getActiveSheet()->SetCellValue('u' . $time, 'Top Of Page CPC');
        $objPHPExcel->getActiveSheet()->SetCellValue('v' . $time, 'Quality Score');
        $objPHPExcel->getActiveSheet()->SetCellValue('w' . $time, 'Bid Adjustment');
        $objPHPExcel->getActiveSheet()->SetCellValue('x' . $time, 'Headline');
        $objPHPExcel->getActiveSheet()->SetCellValue('y' . $time, 'Description Line 1');
        $objPHPExcel->getActiveSheet()->SetCellValue('z' . $time, 'Description Line 2');
        $objPHPExcel->getActiveSheet()->SetCellValue('aa' . $time, 'Display URL');
        $objPHPExcel->getActiveSheet()->SetCellValue('ab' . $time, 'Destination URL');
        $objPHPExcel->getActiveSheet()->SetCellValue('ac' . $time, 'Device Preference');
        $objPHPExcel->getActiveSheet()->SetCellValue('ad' . $time, 'Start Date');
        $objPHPExcel->getActiveSheet()->SetCellValue('ae' . $time, 'End Date');
        $objPHPExcel->getActiveSheet()->SetCellValue('af' . $time, 'Ad Schedule');
        $objPHPExcel->getActiveSheet()->SetCellValue('ag' . $time, 'Campaign Status');
        $objPHPExcel->getActiveSheet()->SetCellValue('ah' . $time, 'AdGroup Status');
        $objPHPExcel->getActiveSheet()->SetCellValue('ai' . $time, 'Status');
        $objPHPExcel->getActiveSheet()->SetCellValue('aj' . $time, 'Approval Status');
        $objPHPExcel->getActiveSheet()->SetCellValue('ak' . $time, 'Suggested Changes');
        $objPHPExcel->getActiveSheet()->SetCellValue('al' . $time, 'Comment');

    }

    function GiveGoogleAnnounceCommand($objPHPExcel, $rkName, $name, $AlphaPlace, $time, $value)
    {
        GiveGoogleCommand($objPHPExcel, $rkName, 'g', $time, $name);
        GiveGoogleCommand($objPHPExcel, $rkName, 'ah', $time, 'Active');
        GiveGoogleCommand($objPHPExcel, $rkName, 'ak', $time, 'Add');
        GiveGoogleCommand($objPHPExcel, $rkName, $AlphaPlace, $time, $value);
    }

    function GiveGoogleCommand($objPHPExcel, $Goal, $AlphaPlace, $time, $value)
    {
        $objPHPExcel->getActiveSheet()->SetCellValue('a' . $time, $Goal);
        $objPHPExcel->getActiveSheet()->SetCellValue($AlphaPlace . $time, $value);
    }



    function SetBegunRkData($objPHPExcel,$rkData)
    {
        $rkAnnounces = $rkData['rkAnnounces'];
        $objPHPExcel->setActiveSheetIndex(0);

        $objPHPExcel->getActiveSheet()->SetCellValue('a' . 1 , 'title');
        $objPHPExcel->getActiveSheet()->SetCellValue('b' . 1, 'descr1');
        $objPHPExcel->getActiveSheet()->SetCellValue('c' . 1, 'descr2');
        $objPHPExcel->getActiveSheet()->SetCellValue('d' . 1, 'url');
        $objPHPExcel->getActiveSheet()->SetCellValue('e' . 1, 'keyword/#thematic#');
        $objPHPExcel->getActiveSheet()->SetCellValue('f' . 1, 'price');
        $objPHPExcel->getActiveSheet()->SetCellValue('g' . 1, 'stopwords');



        for($i = 0;$i < count($rkAnnounces);$i++)
        {
            $announce = $rkAnnounces[$i];
            $minuswordsCellStr = '""';
            if(isset($announce['minuswords']))
            {
                $minuswords = $announce['minuswords'];
                for($y = 0;$y < count($minuswords);$y++)
                {
                    $minuswordsCellStr = $minuswordsCellStr.'- ' . $minuswords[$y];
                }
            }
            $minuswordsCellStr = $minuswordsCellStr .'""';

            $objPHPExcel->getActiveSheet()->SetCellValue('a' . ($i +2) , $announce['beheader']);
            $objPHPExcel->getActiveSheet()->SetCellValue('b' . ($i +2), $announce['betext']);
            $objPHPExcel->getActiveSheet()->SetCellValue('c' . ($i +2), $announce['betext2']);
            $objPHPExcel->getActiveSheet()->SetCellValue('d' . ($i +2), $announce['beurl']);
            $objPHPExcel->getActiveSheet()->SetCellValue('e' . ($i +2), $announce['keywords']);
            $objPHPExcel->getActiveSheet()->SetCellValue('f' .($i +2), $announce['yabet']);
            $objPHPExcel->getActiveSheet()->SetCellValue('g' . ($i +2), $minuswordsCellStr);
        }
    }
?>