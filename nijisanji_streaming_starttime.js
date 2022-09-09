function postMessage() {
  const url = 'https://api.line.me/v2/bot/message/push';
  const token = '';

  const message = getMessage_();
  if(!message) return;

  const payload = {
    to: '',
    messages: [
      {type: 'text', text: message}
    ]
  };

  const params = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      Authorization: 'Bearer ' + token
    },
    payload: JSON.stringify(payload)
  };

  
  try {
    const res = UrlFetchApp.fetch(url, params);
    Logger.log(res)
  } catch(e) {
    // 例外エラー処理
    Logger.log('Error:')
    Logger.log(e)
  }

  function getMessage_(){
    // URLフェッチ
    // スクレイピング対象のURLを指定
    let url = "https://www.itsukaralink.jp";
    let phantom = phantomJSCloudScraping(url);
    let texts = Parser.data(phantom).from('event-card').to('</div>').iterate();

    let schedules = "";
    let now = new Date();
    let hour = now.getHours();

    for (let i = 0; i < texts.length; i++) {
      if(texts[i].match('collabo-icon') != null) continue;
      let streamingStartHour   = textToHour(texts[i], hour)[0];
      let streamingStartMinute = textToHour(texts[i], hour)[1];
      let title = textToTitle(texts[i]);

      console.log(streamingStartHour);
      console.log(streamingStartMinute);
      console.log(title);

      if(streamingStartHour <  hour) continue;
      if(streamingStartHour >= hour + 3) continue;


      schedules += `[${('00'+(streamingStartHour)).slice(-2)}:${('00'+streamingStartMinute).slice(-2)}~]` + '\n' + title + '\n' + '\n';
      console.log(schedules);
    }
    if(schedules === "") return `${(hour)%24}時~${(hour+3)%24}時の間に始まる配信はありません。` + '\n' + `${schedules}`;

    return `${(hour)%24}時~${(hour+3)%24}時の間に始まる配信はこちら！` + '\n' + `${schedules}`;
  }

  function textToHour(text, hour){
    let height = Parser.data(text).from('top: ').to('px').build();

    let offset = 720;
    // 時差に基づくオフセット(9時間)を調整。タイムテーブルは1時間につき縦80px。
    let hourToday;
    if(hour < 9){
      hourToday = (Number(height) + offset) / 80 - 48;
    }else{
      hourToday = (Number(height) + offset) / 80 - 24;
    }
    let minute = parseFloat('0.' + ('' + hourToday).split('.')[1]) * 100 * (60 / 100);
    console.log(Number(height) + offset);
    return [parseInt(hourToday), parseInt(minute)];
  };

  function textToTitle(text){
    let title = Parser.data(text).from('alt="').to('">').build();
    return title;
  };

  function phantomJSCloudScraping(URL) {
    //スクリプトプロパティからPhantomJsCloudのAPIキーを取得する
    let key = PropertiesService.getScriptProperties().getProperty('PHANTOMJSCLOUD_APIKEY');
    //HTTPSレスポンスに設定するペイロードのオプション項目を設定する
    let option =
    {
      url: URL,
      renderType: "HTML",
      outputAsJson: true
    };
    //オプション項目をJSONにしてペイロードとして定義し、エンコードする
    let payload = JSON.stringify(option);
    payload = encodeURIComponent(payload);
    //PhantomJsCloudのAPIリクエストを行うためのURLを設定
    let apiUrl = "https://phantomjscloud.com/api/browser/v2/" + key + "/?request=" + payload;
    //設定したAPIリクエスト用URLにフェッチして、情報を取得する。
    let response = UrlFetchApp.fetch(apiUrl);
    //取得したjsonデータを配列データとして格納
    let json = JSON.parse(response.getContentText());
    //APIから取得したデータからJSから生成されたソースコードを取得
    let source = json["content"]["data"];
    return source;
  }
}