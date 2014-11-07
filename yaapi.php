<?php

if (isset($_GET['method'])  && $_GET['method'] == 'GUI') {
	GetUserInfo();
}

if (isset($_GET['method'])  && $_GET['method'] == 'GetWS') {
	GetWS();
}

function GetUserToken()
{
	$client_id = '';
	$client_secret = '0a4a7df0be6d4cb3a779d8b295f71b6c';
	$redirect_uri = 'http://witheval-ru.1gb.ru/yaapi.php';
	$url = 'https://oauth.yandex.ru/authorize';	
	$result = false;
		$params = array(
		'grant_type'    => 'authorization_code',
		'client_id'     => $client_id,
		'code' => $_SESSION['code'],
		'client_secret' => $client_secret
	);
	
	$url = 'https://oauth.yandex.ru/token';
	
	$curl = curl_init();
	curl_setopt($curl, CURLOPT_URL, $url);
	curl_setopt($curl, CURLOPT_POST, 1);
	curl_setopt($curl, CURLOPT_POSTFIELDS, urldecode(http_build_query($params)));
	curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
	$result = curl_exec($curl);
	curl_close($curl);
	$tokenInfo = json_decode($result, true);
}

function GetUserTokenFromGP()
{
    if($_POST["ya_cl_token"] != null)
        return $_POST["ya_cl_token"];
    else
        return $_GET["ya_cl_token"];
}

function GetUserInfo()
{
    $result = false;
	$params = array(
	    'format'       => 'json',
	    'oauth_token'  => GetUserTokenFromGP()
	);
	$userInfo = json_decode(file_get_contents('https://login.yandex.ru/info' . '?' . urldecode(http_build_query($params))), true);
	if (isset($userInfo['id'])) {
	    $userInfo = $userInfo;
	    $result = true;
	}
	if ($result) {
	    SetCookie("realNameYa",$userInfo['real_name']);
	    SetCookie("emailYa",$userInfo['default_email']);
	    SetCookie("birthdayYa",$userInfo['birthday']);
	    SetCookie("disNameYa",$userInfo['display_name']);
	    SetCookie("idYa",$userInfo['id']);
	    SetCookie("sexYa",$userInfo['sex']);
	}
	$_SESSION['idYa'] = $userInfo['id'];
}

function checkForErrorReport($report)
{
    if(isset($report->{'error_detail'}))
    {
        print_r( $report);
        return true;
    }

    return false;
}

function GetWS()
{
    ClearWSReports();
    $report = json_decode(createWSReaport( $_GET['phrase'], $_GET['regionId']));
    $reportId = json_decode(createWSReaport( $_GET['phrase'], $_GET['regionId']) )->{'data'};
    $check = checkForErrorReport($report);
    $llop = true;
    $counter = 10;
    $report = 'Не удалось подключиться к серверу';
    while($llop && $counter-- > 0)
    {
        sleep(10);
        $report = GetWSReport($reportId);
        $newrep = json_decode($report);
        if(isset($newrep->{'data'})==true)
        {
            $llop = false;
            print_r(json_encode($newrep->{'data'}));
        }

    }
    DeleteWSReport($reportId);

}

function ClearWSReports()
{

    $reports = GetWSReportList();
    $data = json_decode($reports, true);
    $data = $data['data'];

    for($k = 0;$k<count($data);$k++)
    {
        $report = $data[$k];
        DeleteWSReport($report['ReportID']);
    }
}

function GetWSReport($id)
{

    $method = 'GetWordstatReport';
    $params = $id;
    return requestToWS($method, $params);
}

function DeleteWSReport($id)
{
    $method = 'DeleteWordstatReport';
    $params = $id;
    return requestToWS($method, $params);
}

function GetWSReportList()
{
    $method = 'GetWordstatReportList';
    $params = array();
    return requestToWS($method, $params);
}

function createWSReaport($phrase, $regionId)
{
    $method = 'CreateNewWordstatReport';
    $params = array(
                    'Phrases' => array($phrase),
                    'GeoID' => array($regionId)
        );

    return requestToWS($method, $params);
}

function requestToWS($method,$params)
{
    $request = array(
        'token'=> $_GET["ya_cl_token"],
        'method'=> $method,
        'param'=> utf8($params),
        'locale'=> 'ru',
    );

    $request = json_encode($request);
    $opts = array(
        'http'=>array(
            'method'=>"POST",
            'header' => "Content-type: application/json",
            'content'=>$request,
        )
    );

    $context = stream_context_create($opts);
    $result = file_get_contents('https://api.direct.yandex.ru/json-api/v4/', 0, $context);

    return $result;
}

function utf8($struct) {
    if (!is_array($struct)) {
        return $struct;
    }
    foreach ($struct as $key => $value) {
        if (is_array($value)) {
            $struct[$key] = utf8($value);
        }
        elseif (is_string($value)) {
            $struct[$key] = utf8_encode($value);
        }
    }
    return $struct;
}
?>