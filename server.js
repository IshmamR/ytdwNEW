const {spawn, exec} = require('child_process');
var http = require('http');
var fs = require('fs');
var path = require('path');
var express = require('express');
var app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
	// console.log(res.status);
	res.status(200);
	fs.createReadStream(path.join(__dirname, 'index.html')).pipe(res);
});
app.post('/', (req, res) => {
	// console.log(req.body.link);
	downloadVideo(req, res, req.body.link);
	// res.status(200);
	// fs.createReadStream(path.join(__dirname, 'index.html')).pipe(res);
})


app.get('/youtube', (req, res) => {
	console.log(req.method);
});

var port = process.env.PORT || '3000';
app.set('port', port);
var server = http.createServer(app);
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

function onError(error) {
	if (error.syscall !== 'listen') {
		throw error;
	}
	var bind = typeof port === 'string'? 'Pipe ' + port : 'Port ' + port;
	// handle specific listen errors with friendly messages
	switch (error.code) {
		case 'EACCES':
			console.error(bind + ' requires elevated privileges');
			process.exit(1);
			break;
		case 'EADDRINUSE':
			console.error(bind + ' is already in use');
			process.exit(1);
			break;
		default:
			throw error;
	}
}

function onListening() {
	var addr = server.address();
	var bind = typeof addr === 'string'
		? 'pipe ' + addr
		: 'port ' + addr.port;
}


const testt = () => {
	const v = exec('youtube-dl --version', (err, stdout, stderr) => {
		console.log("ERROR: "+err);
		console.log("STDOUT: "+stdout);
		console.log("STDERR: "+stderr);
	});
	// console.log(v);
}
// testt();

/* Send mp4 download for video_id youtube */
const downloadVideo = (req, res, link) => {
	//Perfect CODE 
	try {
		// response attachment for triggering download instead of stream
		res.attachment(`Video.mp4`);
		// Downloading ,Converting mp4 youtube video using video_id 
		const ytdl = spawn('youtube-dl', [
			'-o',//output
			'-',//stdout
			'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',//best mp4 extension , else best
			'--recode-video',//recode video 
			'mp4',//to mp4 if not mp4
			'-a',//input stream
			'-',//stdin
			'--buffer-size', 
			'1024'
		])
		.on('error', (err) => {
			console.log(err);
			// res.status(200);
			// fs.createReadStream(path.join(__dirname, 'index.html')).pipe(res);
		})
		.on('exit', (code) => {
			console.log(`Ytdl exited with code ${code}`);
			// res.status(200);
			// fs.createReadStream(path.join(__dirname, 'index.html')).pipe(res);
		});
		// Setting output pipe first so that we dont lose any bits
		ytdl.stdout.pipe(res).on('error', (err) => {
			console.log(err);
			// res.status(200);
			// fs.createReadStream(path.join(__dirname, 'index.html')).pipe(res);
		});
		// Catching error on stdin 
		ytdl.stdin.on('error', (err) => {
			console.log(err);
		});
		
		// Writing video url to stdin for youtube-dl 
		ytdl.stdin.write(link);
		// Closing the input stream; imp, else it waits
		ytdl.stdin.end();
	}
	catch(error) {
		console.log(error);
	}
};
