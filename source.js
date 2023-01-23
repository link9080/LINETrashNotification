const NOTIFICATION_CHOUMEI_CELL = "F1"
const BURNABLE_GARBAGE＿CELL = "D"
const NON_BURNABLE_GARBAGE＿CELL = "E"
const PET_GARBAGE_CELL = "F"
const BURNABLE_GARBAGE_CHAR_CELL = "G"
const NON_BURNABLE_GARBAGE_CHAR_CELL = "H"
const PET_GARBAGE_CHAR_CELL = "I"
const SPLIT_KEY = "・"
const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];
const SYSTEM_DATE = new Date()
const MESSAGE = "本日*は@です。"
var channel_token = "line@より取得したトークンキー"
let spreadSheetByActive = SpreadsheetApp.getActive()
function myFunction() {

  let activesheet = spreadSheetByActive.getActiveSheet()
  let serchText = activesheet.getRange(NOTIFICATION_CHOUMEI_CELL).getDisplayValue()
  let _number = GetChouRow(activesheet);
  //燃えるゴミの日
  let _burnableFlg = BurnableGarbageReturn(_number, activesheet,SYSTEM_DATE)
  console.info(_burnableFlg)
  if (_burnableFlg) {
    let message = MESSAGE.replace("*",serchText).replace("@", "燃えるゴミの日")
    push(message)
    return;
  }
  //燃えないゴミ
  if (PetNonGarbage(NON_BURNABLE_GARBAGE＿CELL, _number, activesheet,SYSTEM_DATE)) {
    let message = MESSAGE.replace("*",serchText).replace("@", "燃えないゴミの日")
    push(message)
    return;
  }
  //ペットボトル
  if (PetNonGarbage(PET_GARBAGE_CELL, _number, activesheet,SYSTEM_DATE)) {
    let message = MESSAGE.replace("*",serchText).replace("@", "ペットボトルの日")
    push(message)
    return;
  }
}

//webhookから実行される
function doPost(e) {
  // WebHookで取得したJSONデータをオブジェクト化し、取得
  let eventData = JSON.parse(e.postData.contents).events[0];

  //postから受け取ったオブジェクトからユーザーIDとタイムスタンプを取得しスプレットに退避
  let userId = eventData.source.userId;
  let timestamp = eventData.timestamp;
  let sheet = spreadSheetByActive.getSheetByName("シート2")
  let row = sheet.getLastRow()

  //2行目からIDを検索し存在する場合は、追加しない
  let idrange = sheet.getRange(2, 1, row).getValues().flat();

  if (idrange.indexOf(userId) === -1) {
    sheet.getRange(row + 1, 1).setValue(userId)
    sheet.getRange(row + 1, 2).setValue(timestamp)
  }

  //取得したデータから、応答用のトークンを取得
  let replyToken = eventData.replyToken;
  //取得したデータから、メッセージ種別を取得
  let messageType = eventData.message.type;
  //種別がテキストのみ実行
  if(messageType == "text"){
    //取得したデータから、ユーザーが投稿したメッセージを取得
    let userMessage = eventData.message.text;
    //テキストに含まれる文字列により返答するメッセージを設定
    sheet = spreadSheetByActive.getSheetByName("シート1")
    let serchText = sheet.getRange(NOTIFICATION_CHOUMEI_CELL).getDisplayValue()
    let checkDay = SYSTEM_DATE
    let _number = GetChouRow(sheet)
    let lastrow = sheet.getLastRow()
    //燃えるゴミ
    let bunable = sheet.getRange(BURNABLE_GARBAGE_CHAR_CELL+2 + ":" + BURNABLE_GARBAGE_CHAR_CELL+lastrow).getValues().flat()
    let nonBunable = sheet.getRange(NON_BURNABLE_GARBAGE_CHAR_CELL+2 + ":" + NON_BURNABLE_GARBAGE_CHAR_CELL+lastrow).getValues().flat()
    let pet = sheet.getRange(PET_GARBAGE_CHAR_CELL+2 + ":" + PET_GARBAGE_CHAR_CELL+lastrow).getValues().flat()
    let replyMessage;
    //リプライテキストに該当するゴミの日までループ、該当しない文字列の場合はループをぬけて処理終了
    var replyOkflg = false;
    for(let i = 0;;i++){
      if(bunable.indexOf(userMessage) != -1){
        replyOkflg = true;
        if(BurnableGarbageReturn(_number, sheet,checkDay)){
            replyMessage = serchText + "は\n" + yyyyMMdd(checkDay) +"が燃えるゴミの日です。"
            break;
        }
      }
      if(nonBunable.indexOf(userMessage) != -1){
        replyOkflg = true;
        if(PetNonGarbage(NON_BURNABLE_GARBAGE＿CELL, _number, sheet,checkDay)){
            replyMessage = serchText + "は\n" + yyyyMMdd(checkDay) +"が燃えないゴミの日です。"
            break;
        }
      }
      if(pet.indexOf(userMessage) != -1){
        replyOkflg = true;
        if(PetNonGarbage(PET_GARBAGE_CELL, _number, sheet,checkDay)){
            replyMessage = serchText + "は\n" + yyyyMMdd(checkDay) +"がペットボトルゴミの日です。"
            break
        }
      }
      if(!replyOkflg){
        let temp =  bunable.filter(value => value != "").join()
        replyMessage = "燃えるゴミの場合は\n" + temp;
        temp = nonBunable.filter(value => value != "").join()
        replyMessage += "\n燃えないゴミの場合は\n" + temp;
        temp = pet.filter(value => value != "").join()
        replyMessage += "\nペットボトルゴミの場合は\n" + temp;
        replyMessage += "\nをセットしてください。"
        break;
      }

      checkDay.setDate(checkDay.getDate() + 1)
    }
    // 応答メッセージ用のAPI URLを定義
    let url = 'https://api.line.me/v2/bot/message/reply';
    //ユーザーからの投稿メッセージから応答メッセージを用意
    //APIリクエスト時にセットするペイロード値を設定する
    let payload = {
      'replyToken': replyToken,
      'messages': [{
        'type': 'text',
        'text': replyMessage
      }]
    };
    //HTTPSのPOST時のオプションパラメータを設定する
    let options = {
      'payload': JSON.stringify(payload),
      'myamethod': 'POST',
      'headers': { "Authorization": "Bearer " + channel_token },
      'contentType': 'application/json'
    };
    //LINE Messaging APIにリクエストし、ユーザーからの投稿に返答する
    UrlFetchApp.fetch(url, options);
  }
}


function push(text) {
  var url = "https://api.line.me/v2/bot/message/push";
  var headers = {
    "Content-Type": "application/json; charset=UTF-8",
    'Authorization': 'Bearer ' + channel_token,
  };

  //メッセージを送る際スプレッドシートからIDを取得して送信する
  let sheet = spreadSheetByActive.getSheetByName("シート2")
  let row = sheet.getLastRow()
  let idrange = sheet.getRange(2, 1, row).getValues().flat();
  idrange = idrange.filter(item => item != "");
  if (idrange.length != 0) {
    idrange.forEach(function (item) {
      var postData = {
        "to": item,
        "messages": [
          {
            'type': 'text',
            'text': text,
          }
        ]
      };

      var options = {
        "method": "post",
        "headers": headers,
        "payload": JSON.stringify(postData)
      };

      UrlFetchApp.fetch(url, options);
    })
  }
}


function GetChouRow(activesheet){
  let serchText = activesheet.getRange(NOTIFICATION_CHOUMEI_CELL).getDisplayValue()
  let textFinder = activesheet.createTextFinder(serchText);
  let chouCell = textFinder.findAll()[1].getA1Notation();
  //見つかったセルの行を取得
  return chouCell.replace(/[^0-9]/g, '');
}

function BurnableGarbageReturn(_number, activesheet,paraDate) {
  //システム日が燃えるゴミの日か判定
  let _burnableGarbageWeekDay = activesheet.getRange(BURNABLE_GARBAGE＿CELL + _number).getDisplayValue()
  _burnableGarbageWeekDay = _burnableGarbageWeekDay.replace(/曜日/g, "")
  let weekList = _burnableGarbageWeekDay.split(SPLIT_KEY);
  let dateDay = paraDate.getDay()
  let rtn = false
  weekList.some(function (week) {
    let tempweek = WEEKDAYS.indexOf(week)
    rtn = tempweek == dateDay
    if (rtn) { return true; }
  })
  return rtn;

}

function PetNonGarbage(cell, row, sheat,paraDate) {
  //システム日がペットボトルの日か燃えないゴミの判定
  let _weekDayRange = sheat.getRange(cell + row).getDisplayValue()
  //第n曜日の数値を取得
  let hankaku = hankaku2Zenkaku(_weekDayRange)
  let _weekDayNumber = hankaku.replace(/[^0-9]/g, '')
  console.log(_weekDayNumber)
  //何曜日が含まれているかのチェック
  let weekday
  WEEKDAYS.some(function (s, idx) {
    if (_weekDayRange.indexOf(s + '曜') != -1) {
      weekday = idx
      return true
    }
  })
  console.log(weekday)
  //システム日は第n番目のn曜日か取得
  let _nowWeekDay = getDayAndCount(paraDate)
  console.log(_nowWeekDay)
  console.log(_nowWeekDay.day == weekday && _nowWeekDay.count == _weekDayNumber)
  return _nowWeekDay.day == weekday && _nowWeekDay.count == _weekDayNumber
}

function yyyyMMdd(dt){
  var y = dt.getFullYear();
  var m = ("00" + (dt.getMonth()+1)).slice(-2);
  var d = ("00" + (dt.getDate())).slice(-2);
  return y + "年"+ m + "月" +  d+ "日";
}

function getDayAndCount(date) {
  return { day: date.getDay(), count: Math.floor((date.getDate() - 1) / 7) + 1 };
}

function hankaku2Zenkaku(str) {
  return str.replace(/[Ａ-Ｚａ-ｚ０-９]/g, function (s) {
    return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
  });
}