// дерево ключевых запросов в прдставлении KeysTree
var tree;
var vers = '0.3.9';
// дерево альтернативных ключей поиска
var treeAltKeys;
var clientYT;
var maxyahc = 33;
var maxyatc = 75;
var maxgohc = 25;
var maxgotc = 35;
var maxbehc = 30;
var maxbetc = 35;
var yasep = '!';
var gosep = '.';
var besep = '!';
var trueUrl = 'http://www.start5.bz/start5.html';

// Методы всех траниц НАЧАЛО

// настройка после загрузки приложения


$( document ).ready(function() {

    /*$.urlParamQ = function(name){
        var results = new RegExp('[(\?|#)&amp;]' + name + '=([^&amp;#]*)').exec(window.location.href);
        if(results != null)
            return results[1] || 0;
        else
            return 0;
    }*/

    /*if(typeof($.cookie('a_aid')) === 'undefined' && $.urlParamQ('a_aid') != 0)
        $.cookie('a_aid', $.urlParamQ('a_aid'));*/
    /*if (location.href != trueUrl)
        location.href = trueUrl;*/

    //window.history.pushState("", "", 'http://www.start5.bz/start5.html');
    $('.progress-bar').hide();
    showHidWindow('#yandexLogin');
    $('#version').text(vers);
    var parval = $.urlParam('close', window.location.href);
    $(".menuInfo").toggle();
    if(parval == '1')
        window.close();
	// Настроки дерева
	var treeSettings = {check: {enable: true},edit:{drag:{}},data: {simpleData: {enable: true}},view: {showIcon: false},callback: {onCheck: onCheckKeyWord}};
	// Создание дерева
	tree = $.fn.zTree.init($("#treeKeys"), treeSettings,null);
    // установки параметров дерева альтернативных ключей
    var settingsTreeAltKeys = {data: {simpleData: {enable: true}},view: {showIcon: false}};

    // создать дерево альтернативных ключей
    treeAltKeys = $.fn.zTree.init($("#keysTreeAlt"), settingsTreeAltKeys,null);
	
	// показать выбранную в меню страницу
	$( ".nmenuElement" ).click(function() {showPage($(this).attr('id'));});
	
	//  нажатие на кнопку добалвнения минус слов
	$( "#kw_mw_addbtn" ).click(function() {
		// проверка правильности ввода
		if( $( "#add_textminus").val() != "" )
			// добавление минус слова
			addMinuswordsManual($( "#add_textminus").val());	
	});

    $('#galochka').change(function(){
        updateAnCount();
    });

    $('#galochka2').change(function(){
        updateAnCount();
    });

    // показать главную страницу
    showPage("keywords");
	// фильтр ключевых фраз
	//$("#keyw_pool").keyup(function () { filterKeyWords($("#keyw_pool").val());});
    $('#rkPay').click(function(){SaveRK()});
    $("#serKW").keyup(function () { searchAnnounce();});
    $("#seHe").keyup(function () { searchAnnounce();});
    $("#seTe").keyup(function () { searchAnnounce();});
    $("#seUrl").keyup(function () { searchAnnounce();});
    $("#seloc").change(function(){searchAnnounce();});
    $("#errorOnly").change(function(){searchAnnounce();});


    $("#repBtn").click(function(){replaceText()});
	
	$('#cpcbtn').click(function(){showHidWindow('#CPCwnd')});
	// фильтр заголовков
	$(".ad_se_key_input").keyup(function () { 	filterKeyWordsInheader($(".ad_se_key_input").val());	});
	
	// нажатие на кнопку добаления слов с большой буквы
	$("#bb_pole2").click(function() {	insertBigWord($("#bb_pole1").val());});
	
	// перехват нажатия на добавку правила для заголовка, простой формат, просто текст
	$(".he_ru_arrow_div").click(function(){	insertHeaderRule("Новое правило",$(this).nextAll(".rul_text").text(),"");});
	
	// перехват нажатия на добавку правила для заголовка, с условиями поика по ключевой фразе
	$("#addrulebtn").click(function(){rulesnet.AddRule();});

    // показ окна стандартных минус слов
    $("#adddefminwords").click(function(){showHidWindow("#"+ $(this).attr('id') +"_defmin")});

    // показ окна помощи
    //$(".fa-question-circle").click(function(){showHidWindow("#helpwind")});
    $('#vizBtn').click(function(){
        showHidWindow('#vizWnd');
    });
    rulesnet.AddRule();
    // показ окна правил
    $("#rulesetbtn").click(function(){showHidWindow("#rulesetwnd")});
    $("#rulesetbtnmain").click(function(){showHidWindow("#rulesetwnd")});

    $("#fade").css('width',$("html").css('width'));
    $("#fade").css('height',$("html").css('height'));

    $("#rkimport_button").click(function(){
            $('#rkimport_buttonIn').click();

    });
    /*$("#rkimport_buttonIn").change(function () {
        $path = $(this).val().replace(/.+[\\\/]/, "");
        alert($path);
        xlsxParser.parse($path).then(function(data) {
            console.log(data);
        }, function(err) {
            console.log('error', err);
        });
    });*/
    $("#rkimport_buttonIn").change(function () {
        if($("#rkimport_buttonIn").val() != '')
        {
            var file = this.files[0];
            var name = file.name;
            var size = file.size;
            var type = file.type;


            var fd = new FormData();
            fd.append('rkfile', file);
            fd.append('method', 'UploadYaRK');


            $.ajax({
                type: 'POST',
                url: 'start5api.php',
                data: fd,
                processData: false,
                contentType: false,
                dataType: "json",
                success: function(data) {
                    importRK(data);
                },
                error: function(data, er, ad) {
                    console.log(data);
                }
            });
            $("#rkimport_buttonIn").val('');
        }
    });
    $('#importFileBtn').click(function(){$('#importFileBtnIn').click()});

    $("#importFileBtnIn").change(function () {
        if($("#importFileBtnIn").val() != '')
        {
            var file = this.files[0];
            var name = file.name;
            var size = file.size;
            var type = file.type;


            var fd = new FormData();
            fd.append('rkfile', file);
            fd.append('method', 'UploadRKFile');


            $.ajax({
                type: 'POST',
                url: 'start5api.php',
                data: fd,
                processData: false,
                contentType: false,
                dataType: "json",
                success: function(data) {
                    importRKFile(data);
                },
                error: function(data, er, ad) {
                    console.log(data);
                }
            });
            $("#importFileBtnIn").val('');
        }
    });

    function completeHandler(msg){
        console.log(msg);
    }



    $(".hideindbtn").click(function(){ hideHidWindow(); });

    setDefMinWords("#defminwordslist");
    setYandexRegions("#yandexRegion");



    $('#ws_button').click(function(){
        if( $('#keyw_pool').val()!= '')
        {
           GetWS($('#keyw_pool').val(), GetRegion(), null);
           $('#keyw_pool').val('')
        }
    });


    $('#keyw_pool').keypress(function(e) {
        if(e.which == 13 && $('#keyw_pool').val()!= '') {
            GetWS($('#keyw_pool').val(), GetRegion(), null);
            $('#keyw_pool').val('')
        }
    });





    $(function() {
        $(window).scroll(function() {
            if($(this).scrollTop() != 0) {
                $('#backtotop').fadeIn();
            } else {
                $('#backtotop').fadeOut();
            }
        });

        $('#backtotop').click(function() {
            $('body,html').animate({scrollTop:0},800);
        });
    });

    $("#yandexloginbtn").click(function(){
        var neww = window.open("http://oauth.yandex.ru/authorize?response_type=token&client_id=e6b32778a6724ea2b258360a0cf97541","Start5", "height=500,width=500");


        $(neww).unload(function(){

            clientYT = $.urlParam("access_token",neww.location.href);
            if( clientYT != 0 )
            {
                LoadSate();
                закрыть(neww);
                showUserMenu();
            }
        });

        $(neww).load(function(){

            clientYT = $.urlParam("access_token",neww.location.href);
            if( clientYT != 0 )
            {
                LoadSate();
                закрыть(neww);
                showUserMenu();
            }
        });
//        neww.load = new function() { alert('hello');};

    });

    $("#delAll").click(function(){
        tree = $.fn.zTree.init($("#treeKeys"), treeSettings,null);
        tree.refresh();
	treeAltKeys = $.fn.zTree.init($("#keysTreeAlt"), settingsTreeAltKeys,null);
	treeAltKeys.refresh();
        $("#content_header").find(".announc").remove();
	$("#minus").find("div").remove();
        updateAnCount();
    });
});


function показать(сообщение)
{
    alert(сообщение);
}

function закрыть(окно)
{
    окно.open("closer.htm", '_self');
}

function importRK($rkdata)
{
    $anns = $rkdata['anns'];
    for($i = 0; $i < $anns.length;$i++)
    {
        console.log($i + ' из ' + $anns.length + ' импортировано.');
        $ann = $anns[$i];
        $keywords = $ann['keywords'].toString().replace(/\"/g, '').split('-');

        $par = addKeywords(tree,$keywords[0],0,null,0,true)[0];
        if($keywords.length > 1)
        {
            for($i1 = 1;$i1<$keywords.length;$i1++)
            {
                $keywordsM = $keywords[0] + $keywords[$i1].replace(/\-/g, '');
                $node = addKeywords(tree, $keywordsM, 0 , $par, 1,true)[0];
                addMinuswords($node);

            }
        }
        setAnnounce($par,$ann['yaheader'], $ann['yatext'], $ann['yaurl'])
    }
    setBehAnnData();
}

function clearString($str)
{
    $str = $str.replace(/\+/g,'');
    return $str.replace(/\"/g, '');

}

function importRKFile($rkdata)
{
    $anns = $rkdata['anns'];

    $ann = $anns[0];
    $keywords = clearString($ann['keywords'].toString()).split('-');
    $gpar = addKeywords(tree,$keywords[0],0,null,0,true)[0];

    for($i = 1; $i < $anns.length;$i++)
    {
        $ann = $anns[$i];
        $keywords = clearString($ann['keywords'].toString()).split('-');

        $par = addKeywords(tree,$keywords[0],0,$gpar,1,true)[0];
        if($keywords.length > 1)
        {
            for($i1 = 1;$i1<$keywords.length;$i1++)
            {
                $keywordsM = $keywords[0] + $keywords[$i1].replace(/\-/g, '');
                $node = addKeywords(tree, $keywordsM, 0 , $par, 1,true)[0];
                addMinuswords($node);
            }
        }
    }
    setBehAnnData();
}

function SaveRK()
{
    showHidWindow('#payWnd');
    $('#payStatus').text('Отправка денных на сервер.');

   $rkInfo = {
        'rkName':$('#selectRK').val(),
        'rkSubject':'START5 RK '+$('#selectRK').val(),
        'rkTitle':$('#selectRK').val(),
        'email':$.cookie('emailYa'),
        'rkDescription':'START5 import file',
        'useTranslate':$('#galochka2').is(':checked'),
       'useCorrect':$('#galochka').is(':checked'),
        'rkCompanies':[{
                'fileFormat': 'xls',
                'rkType':'ya',
                'regionYandex':$("#yandexRegion").val()

            },
            {
                'fileFormat': 'csv',
                'rkType':'goo',
                'regionGoogle': [$("#yandexRegion").val()]


            },
            {
                'fileFormat': 'csv',
                'rkType':'be',
                'regionYandex':$("#yandexRegion").val()

            }],

        'rkAnnounces':[],
        'viz':{
            'country':$('#vizcountry').val(),
            'city':$('#vizcity').val(),
            'codeCountry':$('#vizcodeCountry').val(),
            'codeCity':$('#vizcodeCity').val(),
            'codeTelephone':$('#vizcodeTelephone').val(),
            'codeAdd':$('#vizaddcode').val(),
            'OGRP':$('#vizOGRN').val(),
            'companyNameFIO':$('#vizcompanyNameFIO').val(),
            'contactFace':$('#vizcontactFace').val(),
            'costStreet':$('#vizcostStreet').val(),
            'postDom':$('#vizpostDom').val(),
            'postCorpus':$('#vizpostCorpus').val(),
            'postOffice':$('#vizpostOffice').val(),
            'wordDS1':$('#vizwordDS1').val(),
            'wordDE1':$('#vizwordDE1').val(),
            'wordHS1':$('#vizwordHS1').val(),
            'wordHE1':$('#vizwordHE1').val(),
            'wordDS2':$('#vizwordDS2').val(),
            'wordDE2':$('#vizwordDE2').val(),
            'wordHS2':$('#vizwordHS2').val(),
            'wordHE2':$('#vizwordHE2').val(),
            'wordDS3':$('#vizwordDS3').val(),
            'wordDE3':$('#vizwordDE3').val(),
            'wordHS3':$('#vizwordHS3').val(),
            'wordHE3':$('#vizwordHE3').val(),
            'email':$('#vizmail').val(),
            'inetPagerType':$('#vizinetPagerType').val(),
            'inetPagerLogin':$('#vizinetPagerLogin').val(),
            'GoodInfo':$('#vizGoodInfo').val()
        }
    };
    $curi = 1;
    $('.announcs').find('.announc').not('.keyinminus').each(function(index, element){
        $('.curSelectedNode').toggleClass('curSelectedNode');
        $tId = $(this).attr('class').replace('announc','').replace('keyinminus','');
        var node = tree.getNodeByTId($tId);
        $minusw = GetMWForNode(node);

        $rkInfo['rkAnnounces'].push({
            'minuswords':$minusw,
            'keywords':node.name,
            'yaheader':justText($(this).find('.yanHeader').text()),
            'yatext':justText($(this).find('.yanText').text()),
            'yaurl':justText($(this).find('.yanUrl').text()),
            'goheader':justText($(this).find('.gooHeader').text()),
            'gotext':justText($(this).find('.gooText').text()),
            'gotext2':justText($(this).find('.gooText2').text()),
            'gourl':justText($(this).find('.gooUrl').text()),
            'beheader':justText($(this).find('.beHeader').text()),
            'betext':justText($(this).find('.beText').text()),
            'betext2':justText($(this).find('.beText2').text()),
            'beurl':justText($(this).find('.beUrl').text()),
            'yabet':$('#clickcost').val(),
            'yabetNet':$('#clickcostNet').val(),
            'gobet':$('#clickcostGo').val(),
            'gobetNet':$('#clickcostNetGo').val(),
            'bebet':$('#clickcostBe').val(),
            'bebetNet':$('#clickcostNetBe').val(),
            'wscount':$('.'+ node.tId + '_wscount').text(),
            'level':$('#'+ node.tId + '_a').attr('class').replace('level','')
        });
    });
    //$rkInfo['tree'] = tree;
    $.ajax({
        type: 'POST',
        url: 'start5api.php',
        dataType: "json",
        data: {
            'method': 'SaveRK',
            'rkInfo':$rkInfo,
            'ya_cl_token':clientYT,
            'a_aid':$.cookie('a_aid')
        },
        error: function (xhr, ajaxOptions, thrownError) {
            //$('#payStatus').text(xhr['responseText']);
            console.log(thrownError);
        },
        success: function(data){
            $('#yaRklnk').empty();
            $('#yaRklnk').append('<h1>К оплате:</h1>');
            $('#yaRklnk').append('<h1><a target="_blank" href="http://www.start5.bz/user.php">Yandex</a></h1>');
            $('#yaRklnk').append('<h1><a target="_blank" href="http://www.start5.bz/user.php">Google</a></h1>');
            $('#yaRklnk').append('<h1><a target="_blank" href="http://www.start5.bz/user.php">Begun</a></h1>');
            /*$('#yaRk').attr("href", "http://www.start5.bz/"+data[0]);
            $('#goRk').attr("href", "http://www.start5.bz/"+data[1]);
            $('#beRk').attr("href", "http://www.start5.bz/"+data[2]);*/
            console.log(data);
        }
    });


}

function LoadSate()
{
    $.ajax({
        type: 'POST',
        url: 'start5api.php',
        dataType: "json",
        data: {
            'method': 'GetUserState',
            'ya_cl_token':clientYT
        },
        error: function (xhr, ajaxOptions, thrownError) {
            console.log(thrownError);
        },
        success: function(data){
            if(data['useCorrect'] == "false")
                $('#galochka').prop('checked', false);
            if(data['useTranslate'] == "false")
                $('#galochka2').prop('checked', false);
            $anns = data['rkAnnounces'];
            $oldlevel = 0;
            $level = 0;
            var node = null;
            $parent = null;
            if(typeof($anns)!=='undefined')
            {
                LoadProccess(0, $anns, $parent, $level, node);
            }
            if(typeof(data['tree'])!=='undefined')
                tree = data['tree'];
        }
    });
}

function LoadProccess(i, anns, parent, level, node)
{
    $('.progress-bar').show();
    $tc = anns.length;
    if(i <$tc)
    {
        $an = anns[i];

        $oldlevel = level;

        if($an['level'] > $oldlevel)
        {
            parent = node;
        }
        else if ( $an['level'] < $oldlevel)
        {
            $dif = $oldlevel - $an['level'];

            if(node!= null)
            {
                parent = node.getParentNode();
            }
            while($dif > 0)
            {
                parent = parent.getParentNode();
                $dif--;
            }//s
        }

        var node = addKeywords(tree, $an['keywords'],$an['wscount'],parent,$an['level'],true)[0];
        SetAnn(node,$an);
        if(typeof($an['minuswords'])!=='undefined'){
            $words = $an['minuswords'];
            for($w = 0;$w < $words.length;$w++)
            {
                if(!isExistMWPure($words[$w]))
                {
                    addKeywords(tree, $an['keywords'] + " " + $words[$w],0,node,$an,false)[0];
                    AddSingleMW(node,$words[$w], $an['keywords']);
                }
            }
        }

        $('#proc').css('width',GetPercString(i, $tc));
        $('#proc').html($tc - i);
        i++;
        setTimeout(function(){
            LoadProccess(i, anns, parent,  $an['level'], node);
        }, 100);

    }
    else
    {
        setTimeout(function(){
            $('.progress-bar').hide();
        }, 100);
    }
}

function SetAnn($node,$data)
{
    ChangeVal('.'+$node.tId, '.beHeader',  $data['beheader'],false, maxbehc);
    ChangeVal('.'+$node.tId, '.beText',  $data['betext'],false, maxbetc);
    ChangeVal('.'+$node.tId, '.beText2',  $data['betext2'],false, maxbetc);
    ChangeVal('.'+$node.tId, '.beUrl', $data['beurl']);
    ChangeVal('.'+$node.tId, '.gooHeader',  $data['goheader'],false, maxgohc);
    ChangeVal('.'+$node.tId, '.gooText',  $data['gotext'],false, maxgotc);
    ChangeVal('.'+$node.tId, '.gooText2',  $data['gotext2'],false, maxgotc);
    ChangeVal('.'+$node.tId, '.gooUrl', $data['gourl']);
    ChangeVal('.'+$node.tId, '.yanHeader',  $data['yaheader'],false, maxyahc);
    ChangeVal('.'+$node.tId, '.yanText',  $data['yatext'],false, maxyatc);
    ChangeVal('.'+$node.tId, '.yanUrl', $data['yaurl']);

}

function GetMWForNode(node)
{
    var childs = node.children;
    $minusw = [];
    $in = 0;
    if(childs != null)
    for(var i = 0; i < childs.length; i++)
    {
        $child = childs[i];
        $('#minus').find('.'+$child.tId).find('strong').each(function(index, element){
            $minusw[$in] = justText($(this).text());
            $in++;
        })
    }
    if(node.getParentNode() != null)
        return GetMWForNode(node.getParentNode());
    return $minusw;
}

function SetYandexImport($announce)
{

}

function moveTreeNode(maintree, nodeId, parentId)
{
    $node = maintree.getNodeByTId(nodeId);
    $nodeTarget = maintree.getNodeByTId(parentId);
    treeObj.moveNode($nodeTarget, $node, "inner");
}

function showUserMenu()
{
    GetClientName();
    hideHidWindow();
    $("#yandexloginbtn").hide();
    $(".menuInfo").show();
}
function GetClientName()
{
    $.ajax({
        type: 'GET',
        // make sure you respect the same origin policy with this url:
        // http://en.wikipedia.org/wiki/Same_origin_policy
        url: 'yaapi.php',
        data: {
            'method': 'GUI',
            'ya_cl_token': clientYT
        },
        success: function(msg){
            $('#realname').html('<a href="user.php" target="_blank">'+$.cookie('realNameYa')+'</a>');
            $('.uname').html($.cookie('realNameYa'));
        }
    });
}

function GetWS(phrase, regionId, parent)
{
    $('#curW').html('<strong>Подготовка списка ключевых запросов и генерация объявлений</strong>');
    $('#doneW').html('Отправлен запрос серверам Яндекс WordStat по ключевому слову <strong>'+ phrase + '</strong>');
    showHidWindow('#processInfo');






    $.ajax({
        type: 'GET',
        url: 'yaapi.php',
        data: {
            'method': 'GetWS',
            'phrase': phrase,
            'ya_cl_token': clientYT,
            'regionId': regionId
        },
        success: function(msg){

            msg = JSON.parse(msg);
            if(typeof(msg['error_code'])==='undefined'){
                AddWSKW(msg,parent);
                hideHidWindow();}
            else{
                alert(msg);
                hideHidWindow();
            }
        },
        error: function(data, er, ad) {
            console.log(data);
        }
    });
}

function GetPercString(number, total)
{
    return Math.floor((number / total) * 100) + '%';
}


function addKWFlow(i, contant, node)
{
    $('.progress-bar').show();
    $tc = contant.SearchedWith.length;
    if(i <$tc)
    {
        if(contant.SearchedWith[i].Shows > $('#minKW').val())
        {
            addKeywords(tree, contant.SearchedWith[i].Phrase,contant.SearchedWith[i].Shows, node,1,true);
        }
        $('#proc').css('width',GetPercString(i, contant.SearchedWith.length));
        $('#proc').html($tc - i);
        i++;
        setTimeout(function(){
            addKWFlow(i, contant, node);
        }, 100);

    }
    else
    {
        $('.progress-bar').hide();
    }
}

function AddWSKW(kw, parand)
{
   // var res = jQuery.parseJSON(kw);
    //addKeywords()
    var contant = kw[0];
    var node = addKeywords(tree, contant.SearchedWith[0].Phrase,contant.SearchedWith[0].Shows,parand,1,true)[0];

    addKWFlow(0, contant, node);

    if(contant.SearchedAlso != null)
    {
        node = addKeywords(treeAltKeys, contant.SearchedAlso[0].Phrase,contant.SearchedAlso[0].Shows,null,1,true)[0];
        for(var i = 0; i <contant.SearchedAlso.length;i++)
        {
            if(contant.SearchedAlso[i].Shows > $('#minKW').val())
            {
                addKeywords(treeAltKeys, contant.SearchedAlso[i].Phrase,contant.SearchedAlso[i].Shows, null,1,true);
            }
        }
    }

    setBehAnnData();



}

function setBehAnnData()
{
    $('#yaEn').change(function() {
        $('.yaEnS').prop('checked', this.checked);
    });

    $('#goEn').change(function() {
        $('.goEnS').prop('checked', this.checked);
    });

    $('#beEn').change(function() {
        $('.beEnS').prop('checked', this.checked);
    });
}

$.urlParam = function(name, param ){
    var sPageURL = param;
    var sURLVariables = sPageURL.replace('#','&');
    sURLVariables = sURLVariables.replace('?','&');
    sURLVariables = sURLVariables.split("&");
    for (var i = 0; i < sURLVariables.length; i++)
    {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == name)
        {
            return sParameterName[1];
        }
    }
    return 0;
}

function setDefMinWords(selector)
{
    var defmin = ["2013","andoid","avi","google","hd","jpeg","mp3","mpeg4","png","porno","sex","windows","анал","анальный","андроид","арт","бесплатно","бесплатные","блог","браузер","бумага","вакансии","вектор","векторные","видео","вконтакте","выглядит","гей","голые","гост","графика","грудь","диплом","доклад","домашняя","зачем","игра","играть","иконка","инструкция","инцест","!какой","карандашом","картинки","кино","клип","книга","компания","минус","музыка","называется","найти","написать","настроить","новости","обои","одноклассники","онлайн","отзывы","пейзажи","песни","пишется","порно","правильно","приготовить","регистрирация","реклама","реферат","рецепт","рисунок","руками","руководство","сайт","саундтрек","своими","секс","сервер","скайп","скачать","слова","слушать","смотреть","советы","создать","способ","страница","торрент","трейлер","удалить","узнать","условиях","установить","файл","фильм","фото","фотошоп","чат","читать","ютуб","яндекс"];
    jQuery.each(defmin,function(i,val){

        $(selector).append('<div class="infoline"><input type="checkbox"/> '+ val +'</div>');
    });
}

function setYandexRegions(selector)
{
    var ids = ["225","1","213","2","54","187","149","159","20","37","197","4","77","191","24","75","33","192","38","21","193","1101","5","63","41","43","22","64","7","35","62","53","8","9","28","23","1092","30","47","65","66","10","48","49","50","25","39","11","51","42","12","239","36","937","13","14","67","15","195","172","76","45","56","1104","16"];
    var regions = ["Россия"," Москва и Московская область"," Москва"," Санкт-Петербург"," Екатеринбург"," Украина"," Беларусь"," Казахстан"," Архангельск"," Астрахань"," Барнаул"," Белгород"," Благовещенск"," Брянск"," Великий Новгород"," Владивосток"," Владикавказ"," Владимир"," Волгоград"," Вологда"," Воронеж"," Грозный"," Иваново"," Иркутск"," Йошкар-Ола"," Казань"," Калининград"," Кемерово"," Кострома"," Краснодар"," Красноярск"," Курган"," Курск"," Липецк"," Махачкала"," Мурманск"," Назрань"," Нальчик"," Нижний Новгород"," Новосибирск"," Омск"," Орел"," Оренбург"," Пенза"," Пермь"," Псков"," Ростов-на-Дону"," Рязань"," Самара"," Саранск"," Смоленск"," Сочи"," Ставрополь"," Сургут"," Тамбов"," Тверь"," Томск"," Тула"," Ульяновск"," Уфа"," Хабаровск"," Чебоксары"," Челябинск"," Черкесск"," Ярославль"];
    jQuery.each(ids,function(i,val){

        $(selector).append('<option id="'+ val +'" class="infoline">'+ regions[i] +'</option>');
    });
}

function hideHidWindow()
{
    $('.hidwind').css('display','none'); $('#fade').css('display','none');
}

function showHidWindow(windName)
{
    // скрыть все окрна
    //$("#hid").appendTo(".hidwind");
    // показать выбранное
    //$("#defmin").appendTo("#ws_targeting");
    $(windName).css('display','inline-table');
    $('#fade').css('display','block');
}

// переключение меню
function showPage(id)
{
	// спрятать весь контент
	$(".content").hide();
	// поставить старый элемент меню неактивным
	$('.activemenu').removeClass('activemenu').addClass('unactivemenu').removeClass('current-demo');
	// поставить выбранный элемент меню активным
	$('#'+id).removeClass('unactivemenu').addClass('activemenu').addClass('current-demo');
	// показать содержание
	$("#content_"+id).show();
}
function GetRegion()
{
    return $('#yandexRegion  :selected').attr('id');
}
// глобальное изменение keyword

// активация ключевого слова
function ActivateKeyWord(node, onlythis)
{
    node.checked = true;
    

    tree.updateNode(node);
	$textk = $("#" + node.tId + "_span");
    $textk.html(wrapWordsInSpan($textk.html()) );

	$textk.find('.moshow').mouseover(function(event)
	{
	    $(this).find('.fa').css('display','inline-block');
	
	
	});
	
	$textk.find('.moshow').find('.fa').click(function(){
	    var sp = $(this).parent('span');
	    addMinuswords(node, $(this).parent('span').text());
	});
	
	$textk.find('.moshow').mouseout(function(event)
	{
	    $(this).find('.fa').css('display','none');
	});
    ActivateKeyWordView( node.tId);
    // удалить из минус слов
    //deleteMinusWord(node);
    // добавка в список ключей на странице заголовки
    //AddkeyTolist2(text,0,id);
    // добавление записи в таблицу заголовков
    //AddKeyHeader(text,id );
    var parent = node.getParentNode();
    while(parent != null)
    {
        deleteMinusWord(parent);
        parent = parent.getParentNode();
    };
    if(typeof(node.children)==='undefined' || onlythis == true)
        return;
    for(var i = 0; i < node.children.length; i++)
    {
        ActivateKeyWord(node.children[i]);
    }
}
// даективация KeyWord повсюду
function ActivateKeyWordView(Id){
    $sel = '.'+ Id;
    $($sel).show().removeClass("keyinminus")
}

// деактивация keyword
function DeactivateKeyWord(node, justDeact)
{
    DeactivateKeyWordView(node.tId);
    if(!justDeact && node.getParentNode() != null)
    {
        // добавление его в минус слова
        addMinuswords(node, justDeact);
    }
    justDeact = true;

    if(typeof(node.children)==='undefined')
        return;
    for(var i = 0; i < node.children.length; i++)
    {
        DeactivateKeyWord(node.children[i], justDeact);
    }
}

// даективация KeyWord повсюду
function DeactivateKeyWordView(Id){
    $sel = '.'+ Id;

    $($sel).hide().addClass("keyinminus")
}

// Методы всех страниц КОНЕЦ
//



//
// Методы ключевых фраз НАЧАЛО

// получить объект KeyWord по Id KeyWord
function GetKeyWordTreeElement(id){	return $("#" + id + "_a");}

// получить селектор KeyWord по Id
function GetKeyWordSelectorBy(id){ return GetKeyWordTreeElement(id);}

// получить значение KeyWord по Id
function GetKeyWordText(id){return GetKeyWordSelectorBy(id).text()}

// изменение статуса ключевого слова на минус слово
function onCheckKeyWord(e, treeId, treeNode) {
	// получить элемент
	var keywordDiv = GetKeyWordTreeElement(treeNode.tId);
    //treeNode.getNodes
	// отметить его как минус слово или ключевую фразу
	keywordDiv.toggleClass("keyinminus");
	
	if( !treeNode.checked)
	{
		DeactivateKeyWord(treeNode, true);
	}
	else if(treeNode.checked)
	{
		ActivateKeyWord(treeNode, false);
	}
    updateAnCount();
}

function GetAnnCount()
{
    return $('.announc').not('.keyinminus').length - 2;
}

function updateAnCount()
{
    $count = GetAnnCount();
    $all = $count*3;
    $('.anncount').text('('+ $count +')');
    if($('#galochka').is(':checked'))
        $all += $count;
    if($('#galochka2').is(':checked'))
        $all += $count;
        $all += $count;
    $('.allAncount').text($all);
    $('.price').text(($all).toFixed(0).toString().substring(0, 5));

}
// вставка с большой буквы
function insertBigWord(word)
{
	// прверка правильности ввода
	if($("#bb_pole1").val()  != "" && isExistBigWord($("#bb_pole1").val()) == false)
	{
		$("#bb_list").append('<input type="button" class="bb_class2" value="Удалить"/><div class="bb_class1">'+ word +'</div>');
			$("#bb_list").children().last().click(function() {
				$(this).prev(this).remove();
				$(this).remove();
		});
	}
}

// проверка сужествования большого слова
function	 isExistBigWord(word)
{
	var ret = false;
	$(".bb_class1").each(function(index, element) {
		if($(this).text().toString().toLowerCase() == word.toString().toLowerCase())
			ret = true;
	});
	return ret;
}



// добавление ключеваго слова в дерево ключевых слов
function addKeywords(treemain, keywords, countcpm, parent, depth, checked)
{
	if(typeof(checked)==='undefined') checked = true;
    $keywordsn = keywords.trim();

    $node = treemain.getNodesByParam("name", $keywordsn, null);
    if( $node.length == 0 )
    {
        // определение глубины
        var dint = 1;
        for( var i = 1 ; i < depth; i++ )
        {
            dint = dint * 10 + 1;
        }

        var zNodes =[
                        { id:dint, tId:(parent == null)?null:parent.tId, name:$keywordsn,checked:checked, open:false}
                    ];
        var treeNode = treemain.addNodes( parent, zNodes);
        var aObj = $("#" + treeNode[0].tId + "_a");



        aObj.mousedown(function(e){
            if(e.button==0 && !(typeof(treeNode[0].children)==='undefined')){

                $childs = treeNode[0].children;
                for($r = 0; $r <$childs.length;$r++)
                {
                    $child = $childs[$r];
                    var childD = $("#" + $child.tId + "_a");
                    childD.toggleClass('curSelectedNode');
                }
            }
            if( e.button == 2 ) {
                if(aObj.hasClass('curSelectedNode'))
                {
                    var selectedNodes = tree.getSelectedNodes();
                    $.contextMenu({
                        selector: "#" + treeNode[0].tId + "_a",
                        trigger: 'right',

                        build: function($trigger, e) {
                            // this callback is executed every time the menu is to be shown
                            // its results are destroyed every time the menu is hidden
                            // e is the original contextmenu event, containing e.pageX and e.pageY (amongst other data)
                            return {
                                callback: function(key, options) {

                                    var typeYa = true;
                                    var typeGo = true;
                                    var typeBe = true;// $(this).hasClass('beData');
                                    $('.curSelectedNode').each(function(){

                                        var rule = rulesnet.GetRuleById(key);
                                        var tId = $(this).attr('id').replace('_a','');
                                        $selector = "." + tId;
                                        $ann = $('.announcs').find($selector)[0];
                                        var keyw = GetFinalKW(tId);
                                        if(typeYa)
                                        {
                                            ChangeAnnVal($ann, rule,keyw,'ya');
                                        }
                                        if(typeGo)
                                        {
                                            ChangeAnnVal($ann, rule,keyw,'goo');
                                        }
                                        if(typeBe)
                                        {
                                            ChangeAnnVal($ann, rule,keyw,'be');
                                        }


                                    });
                                    setBehAnnData();
                                    hideHidWindow();
                                },
                                items: rulesnet.GetRulesName()
                            };

                        }
                    });
                }
                return false;
            }
            return true;
        });

        $textk = aObj.find("#" + treeNode[0].tId + "_span");
        $textk.html(wrapWordsInSpan($textk.html()) );


        $textk.find('.moshow').mouseover(function(event)
        {
            $(this).find('.fa').css('display','inline-block');


        });

        $textk.find('.moshow').find('.fa').click(function(){
            var sp = $(this).parent('span');
            addMinuswords(treeNode[0], $(this).parent('span').text());
        });

        $textk.find('.moshow').mouseout(function(event)
        {
            $(this).find('.fa').css('display','none');
        });


        aObj.prepend(' <span><strong>(<span class="'+ treeNode[0].tId +'_wscount">'+ $.parseNumber(countcpm.toString(), {format:"#,###.00", locale:"us"})  +'</span>)</strong></span>');

        if(checked)
        {
            if(treemain == tree)
            {
                AddAnnouncementHeader($keywordsn,treeNode[0].tId);
            }
            //AddKeyToText(keywords,treeNode[0].tId);
        }

        if(!checked)
        {
            $(aObj).toggleClass("keyinminus");

        }
        $(aObj).dblclick(function(){
            if(treemain == tree)
            {
                GetWS(keywords, GetRegion(), treeNode[0]);
            }
            else
            {
                GetWS(keywords, GetRegion(), null);
            }
        });
        return treeNode;
    }

    return $node;
}



// вывод альтернативных вводов пользоваталя в ввордстате
function addAltKeyWord(keyword, cout)
{

	//$("#right_ws").append('<div class="dve_knopki"><div class="knopka"><a class="a_demo_one">+</a></div><div class="text_vvoda">'+ keyword +'</div></div>');
	
	$("#right_ws").children().last().children('input').click(function(){
		addKeywords(keyword,cout,0,1);
		$(this).parent().remove();
	});
}

// фильтр ключевых фраз
function filterKeyWords(key)
{
	showNodes();
	$("#treeKeys").children("li").each(function(index, element) {
		$(this).children("a").children("span").each(function(index, element) {

			if(typeof($(this).attr("class"))==='undefined' )// &&  $(this).contents(key)
			{
				  if($(this).text().indexOf(key) ==-1)
				  {
					  tree.hideNodes(tree.getSelectedNodes());
				  }
			}
            
        });	
    });
}

function showNodes() {
    nodes = tree.getNodesByParam("isHidden", true);
    tree.showNodes(nodes);
}

function showAnnounces() {
    $('.announcs').find('.announc').not('.keyinminus').show();
}

function searchAnnounce() {
    var loc = $('#seloc').val();
    var hl = '.'+ loc +'Header';
    var tl = '.'+ loc +'Text';
    var ul = '.'+ loc +'Url';
    showAnnounces();
    var kw = $('#serKW').val();
    var he = $('#seHe').val();
    var te= $('#seTe').val();
    var ur = $('#seUrl').val();
    var errorOnly = $("#errorOnly").is(':checked');

    $('.announcs').find('.announc').not('.keyinminus').each(function(index, element) {
        var key = '', header = '', text = '', url = '';
        var show = true;
        $(this).find('.keyInfo').each(function(index, element) {
            key = justText($(this).text());

            if(key.indexOf(kw) == -1 && kw != ''){
                show = false;
            }

        });

        show = hasWord(he, $(this), hl, show);
        show = hasWord(te, $(this), tl, show);
        show = hasWord(ur, $(this), ul, show);
        if(show && errorOnly &&  $(this).find('.anFormError').length == 0)
        {
            show = false;
        }

        if( !show)
        {
            $(this).hide();
        }
        else
        {
            $(this).show();
        }
    });
}

function hasWord(word, container, selector, show)
{
    var superShow = false;
    if( word == '')
        superShow = true;
    else
    {
        container.find(selector).find('.morphinsp').each(function(index, element) {
            data = justText($(this).text());


            if(data.indexOf(word) != -1 )
            {
                superShow =true;
            }

        });
    }
    if( show == true  )
        show = superShow;
    return show;
}


function replaceText(){
    var loc = $('#repLoc').val();
    var place = $('#repPlace').val();
    place = '.' + loc + place;
    var target = $('#repTarget').val();
    var word = $('#repWord').val();
    if(target == '')
    {
        alert('Введите заменяемое слово.');
        return;
    }
    $('.announcs').find(place).find('.editWords').each(function(index, element) {
        var f = $(this).html();
        f = f.replace(target, word);
        $(this).html(f);
    });
}


function hideNodes() {
	nodes = tree.getSelectedNodes();
	tree.hideNodes(nodes);
}

function isExistNote(word)
{
	var ret = false;
	$("#keysTree > li > a > span").each(function(index, element) {
			if($(this).text().toLowerCase().toString() == word.toLowerCase().toString() )
			{
				ret = true;
			}
    });

		return ret;
}

// вывод мимус слов
function addMinuswordsManual(word)
{
	if( isExistNote(word) == false)
	{
		var treeNode = addKeywords(word,0,0,1,false);
		addMinuswords(treeNode[0].tId);
	}
	else
	{
		alert("уже существует такая фраза или минус слово");
	}

	
}

function removeKWFromMW(key, minus)
{
    key = key.split(" ");
    var minusA = minus.split(" ");
    for(var i = 0; i < key.length;i++)
    {
        var d = false;
        for(var y = 0; y < minusA.length;y++){
            var data = levDist(minusA[y], key[i]);
            if(data < 3 || minusA[y][0]=='+')
                minus = minus.replace(minusA[y],"");
        }
    }
    minuswords = minus.replace(/\+/g,'');
    minuswords = minuswords.split(" ");
    return minuswords;
}

function levDist(s, t) {
    var d = []; //2d matrix

    // Step 1
    var n = s.length;
    var m = t.length;

    if (n == 0) return m;
    if (m == 0) return n;

    //Create an array of arrays in javascript (a descending loop is quicker)
    for (var i = n; i >= 0; i--) d[i] = [];

    // Step 2
    for (var i = n; i >= 0; i--) d[i][0] = i;
    for (var j = m; j >= 0; j--) d[0][j] = j;

    // Step 3
    for (var i = 1; i <= n; i++) {
        var s_i = s.charAt(i - 1);

        // Step 4
        for (var j = 1; j <= m; j++) {

            //Check the jagged ld total so far
            if (i == j && d[i][j] > 4) return n;

            var t_j = t.charAt(j - 1);
            var cost = (s_i == t_j) ? 0 : 1; // Step 5

            //Calculate the minimum
            var mi = d[i - 1][j] + 1;
            var b = d[i][j - 1] + 1;
            var c = d[i - 1][j - 1] + cost;

            if (b < mi) mi = b;
            if (c < mi) mi = c;

            d[i][j] = mi; // Step 6

            //Damerau transposition
            if (i > 1 && j > 1 && s_i == t.charAt(j - 2) && s.charAt(i - 2) == t_j) {
                d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + cost);
            }
        }
    }

    // Step 7
    return d[n][m];
}

function addMinuswords(элементДерева, минусСлово)
{

	/*var keyWordId = элементДерева.tId;
	var keywordDiv = GetKeyWordTreeElement(keyWordId);
	var keywordSelector = GetKeyWordSelectorBy(keyWordId);
	var keywordText = GetKeyWordText(keyWordId);
	var treeNode = tree.getNodeByTId(keyWordId);*/
    var minuswords = элементДерева.name;
    элементДерева.checked = false;
    //удалить(элементДерева, true);
    DeactivateKeyWordView(элементДерева.tId);
    tree.updateNode(элементДерева);
    var клучевик = 'всей РК';
    if(элементДерева.getParentNode() != null)
    {
        var parentNode = элементДерева.getParentNode();
        клучевик = parentNode.name;
        minuswords = removeKWFromMW(клучевик ,элементДерева.name);

        for(var i = 0; i <minuswords.length; i ++)
        {
            if(typeof(минусСлово)==='undefined' ||  минусСлово == minuswords[i])
            {
                создать(минусСлово, клучевик, элементДерева);

            }
        }
    }
}

function создать(минусСлово, клучевик, элементДерева)
{
    var существует = isExistMW(минусСлово + ' для '+ клучевик);
    if(минусСлово != '' && !существует)
    {
        var nm = $("#minus").append('<div class=" infoline minus_w '+ элементДерева.tId +'"><input type="button" class="del_button" value="Удалить"/><div class="word_body"> <strong>'+ минусСлово + '</strong> для '+ клучевик +'</div></div>');
        nm.children().last().children("input").click(function(){
            deleteMinusWord(элементДерева, $(this).parent().find('strong').text());
            updateAnCount();
        });
        var parentNode = элементДерева.getParentNode();
        for(var y = 0; y < parentNode.children.length;y++)
        {
            var cnode = parentNode.children[y];
            if(cnode.checked)
            {
                var words = cnode.name.split(" ");
                for(var k = 0; k < words.length;k++)
                {
                    var cword = words[k];
                    if(levDist(cword,минусСлово) < 3 && cnode != элементДерева && минусСлово.length > 3)
                    {
                        удалить(cnode);
                    }
                }
            }
        }
    }
}

function AddSingleMW(node, word, keywords)
{
    var mw = word;
    var nm = $("#minus").append('<div class=" infoline minus_w '+ node.tId +'"><input type="button" class="del_button" value="Удалить"/><div class="word_body"> <strong>'+ word + '</strong> для '+ keywords +'</div></div>');
    nm.children().last().children("input").click(function(){
        deleteMinusWord(node, $(this).parent().find('strong').text());
        updateAnCount();
    });
}

function isExistMW(word)
{
    var res = false;
    $('.word_body').each(function(index, element) {
        var text = $.trim($(this).text());
        if(text == word)
            res = true;
    });
    return res;
}

function isExistMWPure(word)
{
    var res = false;
    $('.word_body').each(function(index, element) {
        var text = $.trim($(this).find('strong').text());
        if(text == word)
            res = true;
    });
    return res;
}

function deleteMinusWord(node, minus)
{
	$(".minus_w."+ node.tId).each(function(index, element) {
        if($(this).find('strong').text()== minus)
        {
            $(this).remove();
            if(IsUsefull(node, minus))
            {
                ActivateKeyWord(node);
            }
            for(var y = 0; y < node.getParentNode().children.length;y++)
            {
                var cnode = node.getParentNode().children[y];
                if(!cnode.checked)
                {
                    if(IsUsefull(cnode) && cnode.name.indexOf(minus) != -1)
                    {
                        ActivateKeyWord(cnode);
                    }
                }
            }
        }
    });
}

function IsUsefull(node, trueWord)
{
    var $words = node.name.replace(trueWord, "");
    var $pwords = node.getParentNode().name.split(" ");
    for(var $i = 0; $i<$pwords.length;$i++)
    {
        $words = $words.replace($pwords[$i], "");
    }
    $words = $words.split(" ");
    for( $i = 0; $i<$words.length;$i++)
    {
        if(isExistMWPure($words[$i]))
        {
            return false;
        }
    }
    return true;
}


// Методы ключевых фраз КОНЕЦ
//

//
// Методы Заголовков НАЧАЛО

function insertHeaderRule(name, text,subtext)
{
	var duplicate = false;
	$( ".nomer").each(function(index, element) {
        if($(this).val() == name)
		{
			duplicate = true;
			alert("Уже имеется правило с названием 'Новое правило'");
		}
    });


	if( text != "" && duplicate == false)
	{
		if(subtext == "")
		{
			$("#left_tab").append('<div id="classniy_blok"><input type="text" class="nomer" value="'+ name +'"/><div class="line2"></div><input class="woordss" value="'+ text +'"  type="text"/></div>');
		}
		else
		{
			$("#left_tab").append('<div id="classniy_blok"><input type="text" class="nomer" value="'+ name +'"/><div class="line2"></div><input class="woordss_withsub" value="'+ text +'"  type="text"/><div class="subtext" >В запросе с <strong>'+ subtext +'</strong></div></div>');
		}
	}

}





function prerulekw(keywords)
{
    keywords = keywords.slice(0,1).toUpperCase() + keywords.slice(1);
    return keywords.replace(/\+/g,"");
}

var MakeClass = function(){
    return function( args ){
        if( this instanceof arguments.callee ){
            if( typeof this.__construct == "function" ) this.__construct.apply( this, args );
        }else return new arguments.callee( arguments );
    };
}
var NewClass = function( variables, constructor, functions ){
    var retn = MakeClass();
    for( var key in variables ){
        retn.prototype[key] = variables[key];
    }
    for( var key in functions ){
        retn.prototype[key] = functions[key];
    }
    retn.prototype.__construct = constructor;
    return retn;
}


var rule = NewClass(
{
    'rid':  0,
    'name':'Название правила',
     'settings' : {
        useKWInHeader : true,
        useKWInText : true,
        useInYa : true,
        useInGo : true,
        useInBe : true
    },
    headEnd: 'Заголовок',
    textEnd : 'Текст',
    text2 : 'Вторая строка',
    'UrlLink': 'http://www.example.com',


   'GetHeader' : function(kw, sep, maxHeader)
    {
        kw = prerulekw(kw);
        var header = '';
        if(this.settings.useKWInHeader)
        {
            header += kw + sep + ' ';
        }
        var res = header + this.headEnd;
        if(res.length > maxHeader)
            res = kw;
        return res;
    },

    'GetText2' : function()
    {
        return this.text2;
    },
    'GetText' : function(kw, sep)
    {
        kw = prerulekw(kw);
        var text = '';
        if(this.settings.useKWInText )
        {
            text += kw + sep + ' ';
        }
        return text + this.textEnd;
    }
});

var rulesnetTempl = NewClass(
    {

        'rulesdata': [],
        'GetRulesName':function(){

           //"edit": {name: "Edit", icon: "edit"}
            var res = {};
            for(var i = 0; i<this.rulesdata.length;i++)
            {
                   res[i] = {name:this.rulesdata[i].name};
            }
            return res;
        },
        'defrule':0,
        'GetRuleById':function(rid)
        {
            /*for(var i = 0; i<this.rulesdata.length;i++)
            {
                if(this.rulesdata[i].rid == rid)
                {
                    return this.rulesdata[i];
                }
            }*/
            return this.rulesdata[rid];
        },
        'AddRule': function()
        {
            var newrule = new rule();
            newrule.settings =  {
            useKWInHeader : true,
                useKWInText : true,
                useInYa : true,
                useInGo : true,
                useInBe : true
            };
            newrule.rid=Math.round((Math.random())*100000);
            this.rulesdata.push(newrule);
            var newruleblock = $('#hid > .ruleTempl').first().clone();
            var htmlid = this.GetHTMLId(newrule.rid);
            newruleblock.toggleClass(htmlid);
            $(newruleblock).find(".deleteRulebtn").first().click(function(){
                rulesnet.DeleteRule(newrule);
            });
            var keywords = '[Ключевик]';
            $(newruleblock).find(".ruleName").first().val(newrule.name);

            $(newruleblock).find(" .yanHeader").first().html(newrule.GetHeader(keywords, yasep, maxyahc));
            $(newruleblock).find(" .yanText").first().html(newrule.GetText(keywords, yasep));
            $(newruleblock).find(" .yanUrl").first().html(newrule.UrlLink);

            $(newruleblock).find(" .gooHeader").first().html(newrule.GetHeader(keywords, gosep, maxgohc));
            $(newruleblock).find(" .gooText").first().html(newrule.GetText(keywords,gosep));
            $(newruleblock).find(" .gooText2").first().html(newrule.GetText2());
            $(newruleblock).find(" .gooUrl").first().html(newrule.UrlLink);

            $(newruleblock).find(" .beHeader").first().html(newrule.GetHeader(keywords, besep, maxbehc));
            $(newruleblock).find(" .beText").first().html(newrule.GetText(keywords, besep));
            $(newruleblock).find(" .beText2").first().html(newrule.GetText2());
            $(newruleblock).find(" .beUrl").first().html(newrule.UrlLink);


            $(newruleblock).find(" .ruleHInp").first().val(newrule.headEnd);
            $(newruleblock).find(" .ruleTInp1").first().val(newrule.textEnd);
            $(newruleblock).find(" .ruleTInp2").first().val(newrule.text2);
            $(newruleblock).find(" .ruleUInp").first().val(newrule.UrlLink);


            $(newruleblock).find(" .ruleName").first().keyup(function(){
                newrule.name = this.value;
            });

            $(newruleblock).find(" .ruleHInp").first().keyup(function(){
                newrule.headEnd = this.value;

                $(newruleblock).find(" .yahc").html(newrule.GetHeader(keywords, yasep, maxyahc).length);
                $(newruleblock).find(" .yanHeader").first().html(newrule.GetHeader(keywords, yasep, maxyahc));
                $(newruleblock).find(" .gooHeader").first().html(newrule.GetHeader(keywords, gosep,maxgohc));
                $(newruleblock).find(" .beHeader").first().html(newrule.GetHeader(keywords,besep, maxbehc));
            });

            $(newruleblock).find(" .ruleTInp1").first().keyup(function(){
                newrule.textEnd = this.value;
                $(newruleblock).find(" .yatc").html(newrule.GetText(keywords, yasep).length);
                $(newruleblock).find(" .gotc2").html(newrule.GetText(keywords, yasep).length + newrule.GetText2().length);
                $(newruleblock).find(" .yanText").first().html(newrule.GetText(keywords, yasep));
                $(newruleblock).find(" .gooText").first().html(newrule.GetText(keywords, gosep));
                $(newruleblock).find(" .beText").first().html(newrule.GetText(keywords, besep));

            });

            $(newruleblock).find(" .ruleTInp2").first().keyup(function(){
                newrule.text2 = this.value;
                $(newruleblock).find(" .yatc").html(newrule.GetText(keywords, yasep).length);
                $(newruleblock).find(" .gotc2").html(newrule.GetText(keywords, yasep).length + newrule.GetText2().length);
                $(newruleblock).find(" .yanText").first().html(newrule.GetText(keywords, yasep));
                $(newruleblock).find(" .gooText2").first().html(newrule.GetText2());
                $(newruleblock).find(" .beText").first().html(newrule.GetText(keywords, besep));
                $(newruleblock).find(" .beText2").first().html(newrule.GetText2());

            });

            $(newruleblock).find(" .ruleUInp").first().keyup(function(){
                newrule.UrlLink = this.value;
                $(newruleblock).find(" .yanUrl").first().html(newrule.UrlLink);
                $(newruleblock).find(" .gooUrl").first().html(newrule.UrlLink);
                $(newruleblock).find(" .beUrl").first().html(newrule.UrlLink);
            });

            $(newruleblock).find('.rulekwHInp').change(function() {
                newrule.settings.useKWInHeader = $(this).is(":checked");
                $(newruleblock).find(" .yahc").html(newrule.GetHeader(keywords,yasep, maxbehc).length);
                $(newruleblock).find(" .yanHeader").first().html(newrule.GetHeader(keywords,yasep, maxbehc));
                $(newruleblock).find(" .gooHeader").first().html(newrule.GetHeader(keywords,gosep, maxbehc));
                $(newruleblock).find(" .beHeader").first().html(newrule.GetHeader(keywords,besep, maxbehc));
            });

            $(newruleblock).find('.rulekwTInp').change(function() {
                newrule.settings.useKWInText = $(this).is(":checked");
                $(newruleblock).find(" .yatc").html(newrule.GetText(keywords, yasep).length);
                $(newruleblock).find(" .gotc2").html(newrule.GetText(keywords, yasep).length + newrule.GetText2().length);

                $(newruleblock).find(" .yanText").first().html(newrule.GetText(keywords, yasep));
                $(newruleblock).find(" .gooText").first().html(newrule.GetText(keywords, gosep));
                $(newruleblock).find(" .beText").first().html(newrule.GetText(keywords, besep));
            });
            $("#annrulesdiv").prepend(newruleblock);
            $(newruleblock).find(" .yahc").html(newrule.GetHeader(keywords,besep,maxyahc).length);
            $(newruleblock).find(" .yatc").html(newrule.GetText(keywords, yasep).length);
        },

        'GetHTMLId':function(id){
            return 'rid_'+ id;
        },

        'DeleteRule':function(rule)
        {
            var block = $('.'+ this.GetHTMLId(rule.rid));
            block.remove();
            var index = this.rulesdata.indexOf(rule);
            this.rulesdata.splice(index,1);

        }
    });
var rulesnet= new rulesnetTempl();

var kw = NewClass(
    {
        'treeSel':'',
        'listSel':''
    });
var kwNet = NewClass({
    'kwords':[],
    'HideKW':function(treeSel)
    {

    }
});
function ChangeVal(announc,valSel, val, wrap, maxc, conter)
{
    $obj = $(announc).find(valSel).first();

    if(!wrap)
        $obj.html(wrapWordsInSpan(val));
    else
        $obj.html(val);

    maxc = typeof maxc !== 'undefined' ? maxc : 0;
    if(maxc > 0)
    {
        var sp = $obj.find('.morphinsp');
        controlMax(sp, maxc);
        SetDeleteTrigger(sp,maxc,$(announc),conter);

    }
}

function ChangeAnnVal(announc,rule, keys, se)
{

    var header, text, text2 = '', url, hc, tc, maxhc, maxtc, adc = 0;
    $sep = '!';
    if(se == 'ya'){
        header = " .yanHeader";
        text = " .yanText";
        url = " .yanUrl";
        hc = '.yahc';
        tc = '.yatc';
        maxhc = maxyahc;
        maxtc = maxyatc;
        $sep = '!';
    }
    if(se == 'goo'){
        header = " .gooHeader";
        text = " .gooText";
        text2 = " .gooText2";
        url = " .gooUrl";
        hc = '.gohc';
        tc = '.gotc';
        maxhc = maxgohc;
        maxtc = maxgotc;
        $sep = '.';
    }
    if(se == 'be'){
        header = " .beHeader";
        text = " .beText";
        text2 = " .beText2";
        url = " .beUrl";
        hc = '.behc';
        tc = '.betc';
        maxhc = maxbehc;
        maxtc = maxbetc;
        $sep = '!';
    }

    ChangeVal(announc, header, rule.GetHeader(keys, $sep,maxhc));


    if(text2 != '')
    {
        var t2 = rule.GetText2();
        adc = t2.length;
        ChangeVal(announc,text2 , t2);
    }

    ChangeVal(announc, url, rule.UrlLink);
    var theader = $(announc).find(header);

    var hcount = justText(theader.text()).length;

    var t2text = $(announc).find(text2);

    var sp = theader.find('.morphinsp');
    controlMax(sp, maxhc);




    $(announc).find(hc).text(hcount);

    var ttext = $(announc).find(text);
    var tcount = justText(ttext.text()).length;

    var textObj = ttext.find('.morphinsp');
    controlMax(textObj, maxtc);

    sp = ttext.find('.morphinsp');
    ChangeVal(announc,text , rule.GetText(keys, $sep),false, maxtc);

    $(announc).find(tc).text(justText(ttext.text()).length);
    $(announc).find(header).keyup(function(e) {
        var sp = $(this).find('.morphinsp');
        controlMax($(this), maxhc);
        $(announc).find(hc).text(justText(sp.text()).length);
    }).focusout(function() {
            $(this).html(wrapWordsInSpan(justText($(this).text())));
            SetDeleteTrigger(theader, maxhc, announc, hc);
        });
    $(announc).find(text2).keyup(function(e) {
        var sp = $(this).find('.morphinsp');
        controlMax($(this), maxtc);
        $(announc).find(tc).text(justText(sp.text()).length);
    }).focusout(function() {
            $(this).html(wrapWordsInSpan(justText($(this).text())));
            SetDeleteTrigger(theader, maxhc, announc, hc);
        });

    $(announc).find(text).keyup(function(e) {
        var sp = $(this).find('.morphinsp');
        controlMax($(this), maxtc);
        $(announc).find(tc).text(justText(sp.text()).length);
    }).focusout(function() {
            $(this).html(wrapWordsInSpan(justText($(this).text())));
            SetDeleteTrigger(theader, maxhc, announc, hc);
        });

    SetDeleteTrigger(theader, maxhc, announc, hc);

    SetDeleteTrigger(t2text, maxtc, announc, tc);
    SetDeleteTrigger(ttext, maxtc, announc, tc);
}


function RefreshAnnounceCounters(announce)
{
    var yah = $(announce).find('.yanHeader');
    var yat = $(announce).find('.yanText');
    var goh = $(announce).find('.gooHeader');
    var got = $(announce).find('.gooText');
    var beh = $(announce).find('.beHeader');
    var bet = $(announce).find('.beText');
    $(announce).find('.gohc').text(justText(goh.text()).length);
    $(announce).find('.yahc').text(justText(yah.text()).length);
    $(announce).find('.behc').text(justText(beh.text()).length);
    $(announce).find('.gotc').text(justText(got.text()).length);
    $(announce).find('.yatc').text(justText(yat.text()).length);
    $(announce).find('.betc').text(justText(bet.text()).length);
}


function SetDeleteTrigger(theader,maxhc, announc, hc)
{
    theader.find('.moshow').mouseover(function(event)
    {
        $(this).find('.fa').css('display','inline-block');
        var sp = $(this).parent('span');
        $(this).find('.fa').click(function(){

            $(this).parent('span').remove();
            SetUpperInSpanLine(theader);
            controlMax(sp, maxhc);
            //$(announc).find(hc).text(justText(sp.text()).length);
            RefreshAnnounceCounters(announc);

        });
    });

    theader.find('.moshow').mouseout(function(event)
    {
        $(this).find('.fa').css('display','none');
    });
    $(announc).find(hc).text(justText(theader.text()).length);
}

function SetUpperInSpanLine(obj)
{
    $mos = obj.find('.moshow');
    if($mos.length > 0)
    {
        $mo = $mos.first();
        $html = $mo.text();
        $html = prerulekw($html);
        $mo.text($html);
    }
}

function controlMax(sp, maxc)
{
    var hcount = justText(sp.text()).length;
    if(hcount > maxc)
    {
        if(!sp.hasClass('anFormError'))
            sp.toggleClass('anFormError');
    }
    else
    {
        if(sp.hasClass('anFormError'))
            sp.toggleClass('anFormError');
    }
}
function justText(text) {
    text = text.replace(/\s+/g, ' ');

    return $.trim(text);

};

function strtr (str, from, to) {
    // From: http://phpjs.org/functions
    // +   original by: Brett Zamir (http://brett-zamir.me)
    // +      input by: uestla
    // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +      input by: Alan C
    // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +      input by: Taras Bogach
    // +   bugfixed by: Brett Zamir (http://brett-zamir.me)
    // +      input by: jpfle
    // +   bugfixed by: Brett Zamir (http://brett-zamir.me)
    // -   depends on: krsort
    // -   depends on: ini_set
    // *     example 1: $trans = {'hello' : 'hi', 'hi' : 'hello'};
    // *     example 1: strtr('hi all, I said hello', $trans)
    // *     returns 1: 'hello all, I said hi'
    // *     example 2: strtr('äaabaåccasdeöoo', 'äåö','aao');
    // *     returns 2: 'aaabaaccasdeooo'
    // *     example 3: strtr('ääääääää', 'ä', 'a');
    // *     returns 3: 'aaaaaaaa'
    // *     example 4: strtr('http', 'pthxyz','xyzpth');
    // *     returns 4: 'zyyx'
    // *     example 5: strtr('zyyx', 'pthxyz','xyzpth');
    // *     returns 5: 'http'
    // *     example 6: strtr('aa', {'a':1,'aa':2});
    // *     returns 6: '2'
    var fr = '',
        i = 0,
        j = 0,
        lenStr = 0,
        lenFrom = 0,
        tmpStrictForIn = false,
        fromTypeStr = '',
        toTypeStr = '',
        istr = '';
    var tmpFrom = [];
    var tmpTo = [];
    var ret = '';
    var match = false;

    // Received replace_pairs?
    // Convert to normal from->to chars
    if (typeof from === 'object') {

        for (fr in from) {
            if (from.hasOwnProperty(fr)) {
                tmpFrom.push(fr);
                tmpTo.push(from[fr]);
            }
        }

        from = tmpFrom;
        to = tmpTo;
    }

    // Walk through subject and replace chars when needed
    lenStr = str.length;
    lenFrom = from.length;
    fromTypeStr = typeof from === 'string';
    toTypeStr = typeof to === 'string';

    for (i = 0; i < lenStr; i++) {
        match = false;
        if (fromTypeStr) {
            istr = str.charAt(i);
            for (j = 0; j < lenFrom; j++) {
                if (istr == from.charAt(j)) {
                    match = true;
                    break;
                }
            }
        } else {
            for (j = 0; j < lenFrom; j++) {
                if (str.substr(i, from[j].length) == from[j]) {
                    match = true;
                    // Fast forward
                    i = (i + from[j].length) - 1;
                    break;
                }
            }
        }
        if (match) {
            ret += toTypeStr ? to.charAt(j) : to[j];
        } else {
            ret += str.charAt(i);
        }
    }

    return ret;
}

function GetAbra(str)
{
    $en_to_ru = {
        'й' : 'q',
        'ц' : 'w',
        'у' : 'e',
        'к' : 'r',
        'е' : 't',
        'н' : 'y',
        'г' : 'u',
        'ш' : 'i',
        'щ' : 'o',
        'з' : 'p',
        'х' : "%5B",
        'ъ' : '%5D',
        'ф' : 'a',
        'ы' : 's',
        'в' : 'd',
        'а' : 'f',
        'п' : 'g',
        'р' : 'h',
        'о' : 'j',
        'л' : 'k',
        'д' : 'l',
        'ж' : '%3B',
        'э' : '\'',
        'я' : 'z',
        'ч' : 'x',
        'с' : 'c',
        'м' : 'v',
        'и' : 'b',
        'т' : 'n',
        'ь' : 'm',
        'б' : '%2C',
        'ю' : '%2C',
        'Й' : 'Q',
        'Ц' : 'W',
        'У' : 'E',
        'К' : 'R',
        'Е' : 'T',
        'Н' : 'Y',
        'Г' : 'U',
        'Ш' : 'I',
        'Щ' : 'O',
        'З' : 'P',
        'Х' : '%7B',
        'Ъ' : '%7D',
        'Ф' : 'A',
        'Ы' : 'S',
        'В' : 'D',
        'А' : 'F',
        'П' : 'G',
        'Р' : 'H',
        'О' : 'J',
        'Л' : 'K',
        'Д' : 'L',
        'Ж' : '%3A',
        'Э' : '%3C',
        '?' : 'Z',
        'ч' : 'X',
        'С' : 'C',
        'М' : 'V',
        'И' : 'B',
        'Т' : 'N',
        'Ь' : 'M',
        'Б' : '%2C',
        'Ю' : '.'
    };
    return strtr(str, $en_to_ru);

}

function GetTrans(str){

    $en_to_ru = {
        'а': 'a',
        'б': 'b',
        'в': 'v',
        'г': 'g',
        'д': 'd',
        'е': 'e',
        'ё': 'jo',
        'ж': 'zh',
        'з': 'z',
        'и': 'i',
        'й': 'j',
        'к': 'k',
        'л': 'l',
        'м': 'm',
        'н': 'n',
        'о': 'o',
        'п': 'p',
        'р': 'r',
        'с': 's',
        'т': 't',
        'у': 'u',
        'ф': 'f',
        'х': 'h',
        'ц': 'c',
        'ч': 'ch',
        'ш': 'sh',
        'щ': 'sch',
        'ъ': '',
        'ы': 'y',
        'ь': '',
        'э': 'je',
        'ю': 'ju',
        'я': 'ja',
        ' ': ' ',
        'і': 'i',
        'ї': 'i'
    };
    return strtr(str, $en_to_ru);

};
// добавить заголовок ключвика
// добавление ключевого в дерево ключевых слов
function AddAnnouncementHeader(keywords, id)
{
    // ключевик
    $old = keywords;
    // подготовка ключевика
    keywords = prerulekw(keywords);

    // нахождение заголовка
    var header = $('.kwid_'+ id );
    if(header.length == 0)
    {
        // получение числе объявлений
        $numberA = GetAnnCount();
        // создание нового объявления
        var newannonc = $('#hid > .announc').first().clone();
        // добавление id к объявлению
        $(newannonc).toggleClass(id);

            //
        // заполнение полей
        $(newannonc).find(" .anNumb").first().html('№'+($numberA + 1));
        $(newannonc).find(" .keyInfo").first().html('<span><span class="fa fa-times keydeactcr"></span>'+$old+'</span>');
        $(newannonc).find(" .keyInfoAbra").first().html(GetAbra($old));
        $(newannonc).find(" .keyInfoTrans").first().html(GetTrans($old));
        $(newannonc).find(" .keyInfo").find('.fa').css('display','none');
        $(newannonc).find(" .keyInfo").first().mouseover(function(event)
        {
            $(this).find('.fa').css('display','inline-block');
            var sp = $(this).parent('span');
            $(this).find('.fa').click(function(){


                var node = tree.getNodeByTId(id);
                удалить(node);
            });
        });

        $(newannonc).find(" .keyInfo").first().mouseout(function(event)
        {
            $(this).find('.fa').css('display','none');
        });
/*
        ChangeVal(newannonc, " .yanHeader", rulesnet.rulesdata[0].GetHeader(keywords));
        ChangeVal(newannonc, " .yanText", rulesnet.rulesdata[0].GetText(keywords));
        ChangeVal(newannonc, " .yanUrl", rulesnet.rulesdata[0].UrlLink);*/
        //TODO привести к общ способу получения данных
        // установка значений объявления
        ChangeAnnVal(newannonc,rulesnet.rulesdata[0],keywords,'ya');
        ChangeAnnVal(newannonc,rulesnet.rulesdata[0],keywords,'goo');
        ChangeAnnVal(newannonc,rulesnet.rulesdata[0],keywords,'be');
       /* $(newannonc).find(" .yanHeader").first().html(rulesnet.rulesdata[0].GetHeader(keywords));
        $(newannonc).find(" .yanText").first().html(rulesnet.rulesdata[0].GetText(keywords));
        $(newannonc).find(" .yanUrl").first().html(rulesnet.rulesdata[0].UrlLink);

        $(newannonc).find(" .gooHeader").first().html(rulesnet.rulesdata[0].GetHeader(keywords));
        $(newannonc).find(" .gooText").first().html(rulesnet.rulesdata[0].GetText(keywords));
        $(newannonc).find(" .gooUrl").first().html(rulesnet.rulesdata[0].UrlLink);

        $(newannonc).find(" .beHeader").first().html(rulesnet.rulesdata[0].GetHeader(keywords));
        $(newannonc).find(" .beText").first().html(rulesnet.rulesdata[0].GetText(keywords));
        $(newannonc).find(" .beUrl").first().html(rulesnet.rulesdata[0].UrlLink);*/

        $(newannonc).find('.annMenu').click(function(){
            /*$('#curW').html('Примененяются правила формирования объявлений');
            $('#doneW').html('Сфрмирован список объявлений для изменений');
            showHidWindow('#processInfo');*/
            $.contextMenu({
                selector: '.annMenu',
                trigger: 'left',

                build: function($trigger, e) {
                    // this callback is executed every time the menu is to be shown
                    // its results are destroyed every time the menu is hidden
                    // e is the original contextmenu event, containing e.pageX and e.pageY (amongst other data)
                    return {
                        callback: function(key, options) {

                            var typeYa = true;
                            var typeGo = true;
                            var typeBe = true;// $(this).hasClass('beData');
                            $('.announcs').find('.annData:visible').each(function(index, element){
                                if($(this).find("input:checked").length > 0)
                                {
                                    var rule = rulesnet.GetRuleById(key);
                                    var tId = getTreeId(this);

                                    var keyw = GetFinalKW(tId);
                                    if(typeYa)
                                    {
                                        ChangeAnnVal(this, rule,keyw,'ya');
                                    }
                                    if(typeGo)
                                    {
                                        ChangeAnnVal(this, rule,keyw,'goo');
                                    }
                                    if(typeBe)
                                    {
                                        ChangeAnnVal(this, rule,keyw,'be');
                                    }
                                }
                            });
                            setBehAnnData();
                            hideHidWindow();
                        },
                        items: rulesnet.GetRulesName()
                    };

                }
            });
        });

        $(".announcs").append(newannonc);
    }
    else
    {
        header.show();
        header.toggleClass("keyinminus");
    }
    updateAnCount();
}

function setAnnounce(node, header, text, url)
{
    $sel = '.'+node.tId;
    ChangeVal($sel, '.yanHeader', header, false, maxyahc,'.yahc');
    ChangeVal($sel, '.gooHeader', header, false, maxgohc,'.gohc');
    ChangeVal($sel, '.beHeader', header, false, maxbehc,'.behc');
    ChangeVal($sel, '.yanText', text, false, maxyatc,'.yathc');

    ChangeVal($sel, '.seUrl', url, false);


    $he = text.split(' ');
    $text1 = $he[0];
    $text2 = '';
    $t2b = false;
    for($i1 = 1;$i1<$he.length;$i1++)
    {
        if(($text1.length + $he[$i1].length + 1) > maxgotc || $t2b == true)
        {
            $text2 += ' ' + $he[$i1];
            $t2b = true;
        }
        else
        {
            $text1 += ' ' + $he[$i1];
        }
    }
    ChangeVal($sel, '.gooText2', $text2, false, maxgotc,'.gotc');
    ChangeVal($sel, '.gooText', $text1, false, maxgotc,'.gotc');
    ChangeVal($sel, '.beText2', $text2, false, maxbetc,'.betcc');
    ChangeVal($sel, '.beText', $text1, false, maxbetc,'.betcc');

}

function getTreeId(selector)
{
    var classNames = $(selector).attr('class');
    classNames = classNames.split(' ');
    for( var  i =0;i<classNames.length;i++)
    {
        if(classNames[i].indexOf('treeKeys_') != -1)
        {
            return classNames[i];
        }
    }
    return getTreeId($(selector).parent('div'));
}

function GetFinalKW(tId)
{
    return $('.announcs').find('.'+tId).find('.keyInfo').text();
}


// фильтр ключевых фраз
function filterKeyWordsInheader(key)
{
	showNodesInHeader();
	$(".keyEntryForm").each(function(index, element) {

		  if($(this).text().indexOf(key) == -1)
		  {
				$(this).hide();
				var id = $(this).attr("class");
				$("."+id).hide();
		  }
    });

//	hideNodes();
}



function findKeyWordInHeader(key)
{
	var res = -1;
	$(".keyEntryForm").each(function(index, element) {

		  if($(this).text().indexOf(key) != -1)
		  {
				res = $(this);	
				return res;		  
		  }
    });
	return res;
}

function showNodesInHeader() {
	var id;
	$(".keyEntryForm").each(function(index, element) {
		$(this).show();
		id = $(this).attr("id");
		$("."+id).show();
    });
}



function hideNodesInHeader() {
	return true;
}

function wrapWordsInSpan(words){
    words = words.split(" ");
    var res = '';
    $.each(words, function(i, v) {
        res += '<span class="editWords moshow">'+ v +'<span class="fa fa-times"></span></span> ';
    });
    res = '<span class="morphinsp" contentEditable="true">'+ res +'</span>';
    return res;
}


var announce = NewClass({
    id:''
});


var announceNetTemplate = NewClass({
    'AddAnnounce':function(){
        var newAnnounce = new announce();
    }
});

function  удалить(ключевик)
{
    DeactivateKeyWord(ключевик, false);
    ключевик.checked = false;
    tree.updateNode(ключевик);
    updateAnCount();
}