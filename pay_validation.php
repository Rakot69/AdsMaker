<?php
    include_once 'robokassa.class.php';
    include_once 'PapApi.class.php';
    include_once 'start5api.php';

    /* простой пример проверки оплаты у себя на сервере */
    $kassa = new Robokassa('Start5.bz', 'Du4a9D0UxX', 'NnVmitw3d2');

    /* назначение параметров */
    $kassa->OutSum  = $_POST['OutSum'];
    $kassa->InvId   = $_POST['InvId'];

    /* добавление кастомных полей из запроса */
    $kassa->addCustomValues(array(
        'shp_user' => $_POST['shp_user'],
        'shp_someData' => $_POST['shp_someData'],
        'shp_rkType' => $_POST['shp_rkType'],
        'shp_a_aid' => $_POST['shp_a_aid']
    ));

    /* проверка цифровой подписи запроса */
    if($kassa->checkHash($_POST['SignatureValue']))
    {
        $state = LoadUserState($_POST['shp_user']);
        GenerateRK($state, $_POST['shp_user'], $_POST['shp_rkType']);
        //sendAffilateData($_POST['OutSum'], $_POST['shp_a_aid']);
        echo 'OK'.$_POST['InvId'];
    }
    else
        echo 'Error';

    function sendAffilateData($cost, $accountId)
    {
        /*$session = new Gpf_Api_Session("http://exampleurl.com/server/scripts/server.php");

        if(!$session->login("SpeCool@gmail.com","NzLVanWx")) {
          die("Cannot login. Message: ".$session->getMessage());
        }
        //Create new transaction:
        $transaction = new Pap_Api_Transaction($session);

        //Fill custom data:
        $transaction->setDateInserted("2010-07-15 14:25:59");
        $transaction->setDateApproved("2010-07-15 14:25:59");
        $transaction->setCampaignid("0b6af6d2");
        $transaction->setTotalCost("10");
        $transaction->setCommTypeId("9b27f852"); //Can be found in Merchant panel: Start -> Campaigns manager -> Edit -> Commissions settings
        $transaction->setStatus("A");
        $transaction->setUserid("77ac3d59");

        //This will automatomaticaly count multi-tier commissions for parent affiliates
        $transaction->setMultiTierCreation("Y");

        //Adding transaction
        if ($transaction->add()) {
          echo 'ok ';
        } else {
          echo 'error ';
        }*/



        /*$saleTracker = new Pap_Api_SaleTracker('http://start5.postaffiliatepro.com/scripts/sale.php', true);

        $saleTracker->setAccountId($accountId);

        $sale1 = $saleTracker->createSale();
        $sale1->setTotalCost($cost);


        $saleTracker->register();*/


        //file_get_contents( "http://start5.postaffiliatepro.com/scripts/sale.php?AccountId=". $accountId ."&TotalCost=". $cost);
        /*$curl_handle=curl_init();
        curl_setopt($curl_handle, CURLOPT_URL,"http://start5.postaffiliatepro.com/scripts/sale.php?AccountId=". $accountId ."&TotalCost=". $cost);
        curl_setopt($curl_handle, CURLOPT_CONNECTTIMEOUT, 2);
        curl_setopt($curl_handle, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($curl_handle, CURLOPT_USERAGENT, 'Your application name');
        $query = curl_exec($curl_handle);
        curl_close($curl_handle);*/
    }

?>