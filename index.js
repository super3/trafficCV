const fs = require('fs');
const axios = require('axios');
const io = require('socket.io')(3052);
const Jimp = require('jimp');
const util = require('util');

const cameras = [
	38
];

io.on('connection', socket => {
	socket.emit('cameras', cameras);
});

setInterval(async () => {
	await Promise.all(cameras.map(async id => {
		const res = await axios({
			method: 'get',
			responseType: 'arraybuffer',
			url: `http://traffic.sandyspringsga.gov/CameraImage.ashx?cameraId=${id}`
		});

		const image = await Jimp.read(res.data);
		image.crop(122-8, 94-15, 16, 30);

		io.emit(`image-original-${id}`, res.data);
		io.emit(`image-${id}`, await util.promisify(image.getBuffer.bind(image))('image/jpeg'));
	}));
}, 1000 / 5);