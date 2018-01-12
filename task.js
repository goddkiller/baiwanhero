var gm  = require("gm");
var pr = require('child_process');
var baidu = require('./baidu.js');

var colors = require('colors');

colors.setTheme({  
    silly: 'rainbow',  
    input: 'grey',  
    verbose: 'cyan',  
    prompt: 'red',  
    info: 'green',  
    data: 'blue',  
    help: 'cyan',  
    warn: 'yellow',  
    debug: 'magenta',  
    error: 'red'  
});  
// # 截取题目
// left = 90 # 距离左边的像素
// top = 250 # 距离顶部的像素
// right = 70 # 距离右边的像素
// bottom = 600 #距离顶部的像素
var body = {
	left:90,
	top:250,
	right:70,
	bottom:1250
}

var op = {
	left: 90,
	right:70,
	top:600,
	bottom:1250,
}



var agm = {
	size: function (img) {
		return new Promise ((resolve ,reject) => {
			
			img.size(function (err, size) {
				if (err) {
					reject(err);
					return;
				}
				resolve(size);
			})
		});		
	},

	asy: function (img, method) {
		var argus = Array.prototype.concat.apply([],arguments)
		argus.shift();argus.shift();
		return new Promise ((resolve ,reject) => {
			argus.push(function (err,res) {
				if (err) {
					reject(err);
					return;
				}

				resolve(res);
			});
			img[method].apply(img, argus);
		});			
	}

}

var readline = require('readline');


async function read () {
	var rl = readline.createInterface({
	  input: process.stdin,
	  output: process.stdout
	});
	return new Promise ((resolve ,reject) => {
		rl.question('在题目开始时，按任意键开始答题', (answer) => {
		  // 对答案进行处理

		  rl.close();
		  resolve();
		});
	});

}

async function run () {
	try {
		var t = new Date();
		var imagepath = './screenshots/';

		var num = 1;

		pr.execSync("adb shell /system/bin/screencap -p /sdcard/screenshot.png");
		pr.execSync("adb pull /sdcard/screenshot.png " + imagepath);

		var cost = new Date() - t;
		console.log('截图耗时：' + cost/1000+ '秒');

		var img = gm(imagepath + "/screenshot.png");
		var path_name = imagepath + 'subject' + '1.png';
		// var size = await agm.size(img);
		var size = await agm.asy(img, 'size');
		var subject_img = img.crop(size.width - body.left - body.right, body.bottom - body.top, body.left, body.top);
		await agm.asy(subject_img, 'write', path_name);
		// subject.write
		// var option = img.crop(size.width - op.left - op.right, op.bottom - op.top, op.left, op.top);
		// await agm.asy(subject_img, 'write', "e:/screenshots/option1.png");


		var res = await baidu.ocr(path_name)
		// var opts = await baidu.ocr('e:/screenshots/option1.png')


		try{
			res = JSON.parse(res);
		} catch (e) {
			console.log(e);
		}
		// console.log(res.words_result);
		// console.log(opts);
		// console.log(res)
		if (res.words_result) {
			var ocr_words = res.words_result.map(function (word) {
				return word.words;
			})
			
			var opts = ocr_words.splice(ocr_words.length - 3,3);
			var subject = ocr_words.join("");
		}

		console.log(subject);

		if (!subject) {
			console.log("截图或者ocr异常");
			return;
		}
		
		


		subject = subject.substr(2);

		// var cifa = await baidu.cifa(subject);

		var cost = new Date() - t;
		console.log('ocr耗时：' + cost/1000+ '秒');
		var answer = await baidu.zhidao(subject);
		var cost = new Date() - t;
		console.log('搜索耗时：' + cost/1000+ '秒');

		var answer_opts = [], ans, max = 0;
		var ind ,min_opt;

		for (let opt of opts) {
			var count = answer.split(opt).length - 1;
			var index = answer.indexOf(opt);
			var tmp = {word:opt, ct:count};

			// if (subject.indexOf(opt) >=0 ) {
			// 	tmp.ct = 0;
			// }

			answer_opts.push(tmp);

			if (index != -1 && (ind===undefined || index < ind)) {
				min_opt = tmp;
				ind = index;
			}
			
		}
				// console.log(min_opt)

		min_opt && (min_opt.ct = min_opt.ct*2.5);

		for (let o of answer_opts) {
			// console.log(o)
			console.log(o.word + ' : ' + o.ct);
			if (o.ct > max) {
				ans = o.word;
				max = o.ct;
			}
		}

		
		console.log('答案：'+ans.green);
		var cost = new Date() - t;
		console.log('耗时：' + cost/1000+ '秒');

	} catch(e) {
		console.log(e)
		console.log("程序异常")
	}
	
}


async  function start() {
	while (true) {
		await read();
		await run()
	}

}

if (require.main === module) {
	start()
}

