const NOTIFICATION_CHOUMEI_CELL = "F1"
const BURNABLE_GARBAGE�QCELL = "D"
const NON_BURNABLE_GARBAGE�QCELL = "E"
const PET_GARBAGE_CELL = "F"
const BURNABLE_GARBAGE_CHAR_CELL = "G"
const NON_BURNABLE_GARBAGE_CHAR_CELL = "H"
const PET_GARBAGE_CHAR_CELL = "I"
const SPLIT_KEY = "�E"
const WEEKDAYS = ['��', '��', '��', '��', '��', '��', '�y'];
const SYSTEM_DATE = new Date()
const MESSAGE = "�{��*��@�ł��B"
var channel_token = "viT7xnn8hvZ1Jzuu1S6nPQl1JAYr5lgbUzpO+OZWgGQF4EtH0hzUtQQsUNUsLvj1RCb4r4pDY2MAkLNHBP2sFOPjQEdUHCvPUOrOQ2Z5XHzi39D+mYdo/zOdJxJi3GtR/TX0wqazbSB92cfFnYZ4ZgdB04t89/1O/w1cDnyilFU="
let spreadSheetByActive = SpreadsheetApp.getActive()
function myFunction() {

  let activesheet = spreadSheetByActive.getActiveSheet()
  let serchText = activesheet.getRange(NOTIFICATION_CHOUMEI_CELL).getDisplayValue()
  let _number = GetChouRow(activesheet);
  //�R����S�~�̓�
  let _burnableFlg = BurnableGarbageReturn(_number, activesheet,SYSTEM_DATE)
  console.info(_burnableFlg)
  if (_burnableFlg) {
    let message = MESSAGE.replace("*",serchText).replace("@", "�R����S�~�̓�")
    push(message)
    return;
  }
  //�R���Ȃ��S�~
  if (PetNonGarbage(NON_BURNABLE_GARBAGE�QCELL, _number, activesheet,SYSTEM_DATE)) {
    let message = MESSAGE.replace("*",serchText).replace("@", "�R���Ȃ��S�~�̓�")
    push(message)
    return;
  }
  //�y�b�g�{�g��
  if (PetNonGarbage(PET_GARBAGE_CELL, _number, activesheet,SYSTEM_DATE)) {
    let message = MESSAGE.replace("*",serchText).replace("@", "�y�b�g�{�g���̓�")
    push(message)
    return;
  }
}

//webhook������s�����
function doPost(e) {
  // WebHook�Ŏ擾����JSON�f�[�^���I�u�W�F�N�g�����A�擾
  let eventData = JSON.parse(e.postData.contents).events[0];

  //post����󂯎�����I�u�W�F�N�g���烆�[�U�[ID�ƃ^�C���X�^���v���擾���X�v���b�g�ɑޔ�
  let userId = eventData.source.userId;
  let timestamp = eventData.timestamp;
  let sheet = spreadSheetByActive.getSheetByName("�V�[�g2")
  let row = sheet.getLastRow()

  //2�s�ڂ���ID�����������݂���ꍇ�́A�ǉ����Ȃ�
  let idrange = sheet.getRange(2, 1, row).getValues().flat();

  if (idrange.indexOf(userId) === -1) {
    sheet.getRange(row + 1, 1).setValue(userId)
    sheet.getRange(row + 1, 2).setValue(timestamp)
  }

  //�擾�����f�[�^����A�����p�̃g�[�N�����擾
  let replyToken = eventData.replyToken;
  //�擾�����f�[�^����A���b�Z�[�W��ʂ��擾
  let messageType = eventData.message.type;
  //��ʂ��e�L�X�g�̂ݎ��s
  if(messageType == "text"){
    //�擾�����f�[�^����A���[�U�[�����e�������b�Z�[�W���擾
    let userMessage = eventData.message.text;
    //�e�L�X�g�Ɋ܂܂�镶����ɂ��ԓ����郁�b�Z�[�W��ݒ�
    sheet = spreadSheetByActive.getSheetByName("�V�[�g1")
    let serchText = sheet.getRange(NOTIFICATION_CHOUMEI_CELL).getDisplayValue()
    let checkDay = SYSTEM_DATE
    let _number = GetChouRow(sheet)
    let lastrow = sheet.getLastRow()
    //�R����S�~
    let bunable = sheet.getRange(BURNABLE_GARBAGE_CHAR_CELL+2 + ":" + BURNABLE_GARBAGE_CHAR_CELL+lastrow).getValues().flat()
    let nonBunable = sheet.getRange(NON_BURNABLE_GARBAGE_CHAR_CELL+2 + ":" + NON_BURNABLE_GARBAGE_CHAR_CELL+lastrow).getValues().flat()
    let pet = sheet.getRange(PET_GARBAGE_CHAR_CELL+2 + ":" + PET_GARBAGE_CHAR_CELL+lastrow).getValues().flat()
    let replyMessage;
    //���v���C�e�L�X�g�ɊY������S�~�̓��܂Ń��[�v�A�Y�����Ȃ�������̏ꍇ�̓��[�v���ʂ��ď����I��
    var replyOkflg = false;
    for(let i = 0;;i++){
      if(bunable.indexOf(userMessage) != -1){
        replyOkflg = true;
        if(BurnableGarbageReturn(_number, sheet,checkDay)){
            replyMessage = serchText + "��\n" + yyyyMMdd(checkDay) +"���R����S�~�̓��ł��B"
            break;
        }
      }
      if(nonBunable.indexOf(userMessage) != -1){
        replyOkflg = true;
        if(PetNonGarbage(NON_BURNABLE_GARBAGE�QCELL, _number, sheet,checkDay)){
            replyMessage = serchText + "��\n" + yyyyMMdd(checkDay) +"���R���Ȃ��S�~�̓��ł��B"
            break;
        }
      }
      if(pet.indexOf(userMessage) != -1){
        replyOkflg = true;
        if(PetNonGarbage(PET_GARBAGE_CELL, _number, sheet,checkDay)){
            replyMessage = serchText + "��\n" + yyyyMMdd(checkDay) +"���y�b�g�{�g���S�~�̓��ł��B"
            break
        }
      }
      if(!replyOkflg){
        let temp =  bunable.filter(value => value != "").join()
        replyMessage = "�R����S�~�̏ꍇ��\n" + temp;
        temp = nonBunable.filter(value => value != "").join()
        replyMessage += "\n�R���Ȃ��S�~�̏ꍇ��\n" + temp;
        temp = pet.filter(value => value != "").join()
        replyMessage += "\n�y�b�g�{�g���S�~�̏ꍇ��\n" + temp;
        replyMessage += "\n���Z�b�g���Ă��������B"
        break;
      }

      checkDay.setDate(checkDay.getDate() + 1)
    }
    // �������b�Z�[�W�p��API URL���`
    let url = 'https://api.line.me/v2/bot/message/reply';
    //���[�U�[����̓��e���b�Z�[�W���牞�����b�Z�[�W��p��
    //API���N�G�X�g���ɃZ�b�g����y�C���[�h�l��ݒ肷��
    let payload = {
      'replyToken': replyToken,
      'messages': [{
        'type': 'text',
        'text': replyMessage
      }]
    };
    //HTTPS��POST���̃I�v�V�����p�����[�^��ݒ肷��
    let options = {
      'payload': JSON.stringify(payload),
      'myamethod': 'POST',
      'headers': { "Authorization": "Bearer " + channel_token },
      'contentType': 'application/json'
    };
    //LINE Messaging API�Ƀ��N�G�X�g���A���[�U�[����̓��e�ɕԓ�����
    UrlFetchApp.fetch(url, options);
  }
}


function push(text) {
  var url = "https://api.line.me/v2/bot/message/push";
  var headers = {
    "Content-Type": "application/json; charset=UTF-8",
    'Authorization': 'Bearer ' + channel_token,
  };

  //���b�Z�[�W�𑗂�ۃX�v���b�h�V�[�g����ID���擾���đ��M����
  let sheet = spreadSheetByActive.getSheetByName("�V�[�g2")
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
  //���������Z���̍s���擾
  return chouCell.replace(/[^0-9]/g, '');
}

function BurnableGarbageReturn(_number, activesheet,paraDate) {
  //�V�X�e�������R����S�~�̓�������
  let _burnableGarbageWeekDay = activesheet.getRange(BURNABLE_GARBAGE�QCELL + _number).getDisplayValue()
  _burnableGarbageWeekDay = _burnableGarbageWeekDay.replace(/�j��/g, "")
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
  //�V�X�e�������y�b�g�{�g���̓����R���Ȃ��S�~�̔���
  let _weekDayRange = sheat.getRange(cell + row).getDisplayValue()
  //��n�j���̐��l���擾
  let hankaku = hankaku2Zenkaku(_weekDayRange)
  let _weekDayNumber = hankaku.replace(/[^0-9]/g, '')
  console.log(_weekDayNumber)
  //���j�����܂܂�Ă��邩�̃`�F�b�N
  let weekday
  WEEKDAYS.some(function (s, idx) {
    if (_weekDayRange.indexOf(s + '�j') != -1) {
      weekday = idx
      return true
    }
  })
  console.log(weekday)
  //�V�X�e�����͑�n�Ԗڂ�n�j�����擾
  let _nowWeekDay = getDayAndCount(paraDate)
  console.log(_nowWeekDay)
  console.log(_nowWeekDay.day == weekday && _nowWeekDay.count == _weekDayNumber)
  return _nowWeekDay.day == weekday && _nowWeekDay.count == _weekDayNumber
}

function yyyyMMdd(dt){
  var y = dt.getFullYear();
  var m = ("00" + (dt.getMonth()+1)).slice(-2);
  var d = ("00" + (dt.getDate())).slice(-2);
  return y + "�N"+ m + "��" +  d+ "��";
}

function getDayAndCount(date) {
  return { day: date.getDay(), count: Math.floor((date.getDate() - 1) / 7) + 1 };
}

function hankaku2Zenkaku(str) {
  return str.replace(/[�`-�y��-���O-�X]/g, function (s) {
    return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
  });
}