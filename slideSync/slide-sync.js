
var rS;

function slideSync(http) {

	if ( arguments.callee._singletonInstance )
		return arguments.callee._singletonInstance;
	arguments.callee._singletonInstance = this;

	rS = this;

	var io = require('socket.io').listen(http);

	this.currentAdmin = '';

	io.of('/sync').on('connection', this.onConnection);
}

slideSync.prototype = {

	onConnection: function(socket) {

		if(rS.currentAdmin) {

			socket.emit('controlAssigned', rS.currentAdmin);

		}

		socket.on('takeControl', function(name){
			rS.onTakeControl(socket, name);
		});

		socket.on('releaseControl', function(){
			rS.onReleaseControl(socket);
		});

		socket.on('navigateTo', function(index){
			rS.onNavigateTo(socket, index);
		});

		socket.on('disconnect', function(){
			rS.onReleaseControl(socket);
		});

	},

	onTakeControl: function(socket, name){
		socket.set('admin', true, function(err) {
			handleError(err);

			rS.currentAdmin = name;

			socket.broadcast.emit('controlAssigned', name);
		});
	},

	onReleaseControl: function(socket) {

		socket.get('admin', function(err, admin) {

			handleError(err);

			if(admin) {

				socket.set('admin', false);
				socket.broadcast.emit('controlReleased');

				rS.currentAdmin = '';
			}

		});

	},

	onNavigateTo: function(socket, index){

		socket.get('admin', function(err, admin) {

			handleError(err);

			if(admin) {

				socket.broadcast.emit('navigateTo', index);

			}

		});

	}
};


function handleError(err) {

	if(err) {
		console.log('Error: ', err.msg);	
	}
	
}


module.exports = function(http) {
	return new slideSync(http);
}