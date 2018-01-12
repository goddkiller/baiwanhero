var request = require("request");
var fs = require("fs");
var iconv = require("iconv-lite");
var cheerio = require("cheerio");

var token;

function hget (param) {
	return new Promise ((resolve ,reject) => {
		request(param, (error, response, body) => {
			if (error) {
				
				reject(error);
			} 

			resolve(body);
		});
	})	
}

var ocr_url = "https://aip.baidubce.com/rest/2.0/ocr/v1/general_basic";


async function  get_ocr (image_path) {


	var imageBuf = fs.readFileSync(image_path);

	var b64 = imageBuf.toString("base64");

	if (!token) {
		var res = await hget({
			url: 'https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=0gjhNMtNWEBcjD1BUZkgsShR&client_secret=AvTbEbxNnOSG7UumpdsxSef3LIe6IzmN' 
		})

		res = JSON.parse(res);

		token = res.access_token;		
	}


	var param = {
		url: ocr_url + '?access_token=' + token,
		header: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		// proxy:'http://127.0.0.1:8888',
		method:'post',
		body:'image=' + encodeURIComponent(b64)
	}	

	res = await hget(param);

	// console.log(res);

	return res;
	// return new Promise ((resolve ,reject) => {
	// 	
	// });		

}

async function zhidao (subject) {
	var url = "https://zhidao.baidu.com/search?lm=0&rn=10&pn=0&fr=search&ie=utf-8&word=" + encodeURIComponent(subject);
	var param = {
		url: url,
		header: {
			'Accept-Encoding': 'gzip',
			'Accept-Language': 'zh-CN,zh;q=0.9',
			'Content-type': ':text/html;charset=utf-8',
			'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36',
		},

		gzip: true,
		encoding :null
	};
	var res = await hget(param);

	res = iconv.decode(res, 'GBK');

	$ = cheerio.load(res);
	
	res = $(".answer").text();
	return res;

}



async function cifa (subject) {

	if (!token) {
		var res = await hget({
			url: 'https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=0gjhNMtNWEBcjD1BUZkgsShR&client_secret=AvTbEbxNnOSG7UumpdsxSef3LIe6IzmN' 
		})

		res = JSON.parse(res);

		token = res.access_token;		
	}

	var url = "https://aip.baidubce.com/rpc/2.0/nlp/v1/lexer";


	var param = {
		url: url + '?access_token=' + token,
		header: {
			'Content-Type': 'application/json'
		},

		// encoding :null,
		// proxy:'http://127.0.0.1:8888',
		method:'post',
		body:JSON.stringify({
			text: iconv.encode(subject, 'GBK').toString('binary')
		})
	}	

	var res = await hget(param);
	// console.log(res);
	res = iconv.decode(res, 'GBK');
	// console.log(res);

	return res;
}


module.exports = {
	ocr : get_ocr,
	zhidao: zhidao,
	cifa: cifa
}