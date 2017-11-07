var fs = require('fs');
var fetch = require('node-fetch');

//ファイルを一行ずつ読んでくる関数
function readLines(input, callback) {
  var remaining = '';

  input.on('data', function(data) {
    remaining += data;
    var index = remaining.indexOf('\n');
    var last  = 0;
    while (index > -1) {
      var line = remaining.substring(last, index);
      last = index + 1;
      callback(line);
      index = remaining.indexOf('\n', last);
    }

    remaining = remaining.substring(last);
  });

  input.on('end', function() {
    if (remaining.length > 0) {
      callback(remaining);
    }
  });
}


//index
var input = fs.createReadStream('urls.txt');
var now = new Date();
var timeStamp = now.getTime();
readLines(input, function(line){
  var cashePath = 'https://webcache.googleusercontent.com/search?q=cache:';
  var url = cashePath + encodeURIComponent(line);
  fetchResult(url, timeStamp);
})




//urlをfetchし、responseからcasheされた日付を取る
function fetchResult(url, timeStamp){
  fetch(url)
    .then(function(res){
      if(res.status !== 200){
        console.log('------------------response error code : ' + res.status + '------------------');
      }else{
        console.log('------------------response succeed 200!------------------');
        var casheTimeStr = getCasheTime(res.body.toString());
        fs.appendFile('result' + timeStamp + '.txt', '\r\n' + casheTimeStr, function (err) {
          if (err) {
            console.log(err);
          }else{
            console.log(url + 'has been appended!');
          }
       });
      }
    });
}


  //fetchした結果文字からキャッシュ日付を取る
  function getCasheTime(body){
    var result = body.match(/のキャッシュです。 このページは (.+)に取得されたものです/);
    if(result){
      return result[1];
    }else{
      return "response body does not contain time div";
    }
  }

// //test
// fetchResult('https://www.principle-c.com');
