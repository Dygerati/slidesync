
var sync;

function slideSync(http) {

	if ( arguments.callee._singletonInstance )
		return arguments.callee._singletonInstance;
	arguments.callee._singletonInstance = this;

	sync = this;

	var io = require('socket.io').listen(http);

	this.currentAdmin = '';

	io.of('/sync').on('connection', this.onConnection);
}

slideSync.prototype = {

	onConnection: function(socket) {

		if(sync.currentAdmin) {

			socket.emit('controlAssigned', sync.currentAdmin);

		}

		socket.on('takeControl', function(name){
			sync.onTakeControl(socket, name);
		});

		socket.on('releaseControl', function(){
			sync.onReleaseControl(socket);
		});

		socket.on('navigateTo', function(index){
			sync.onNavigateTo(socket, index);
		});

		socket.on('disconnect', function(){
			sync.onReleaseControl(socket);
		});

	},

	onTakeControl: function(socket, name){
		socket.set('admin', true, function(err) {
			handleError(err);

			sync.currentAdmin = name;

			socket.broadcast.emit('controlAssigned', name);
		});
	},

	onReleaseControl: function(socket) {

		socket.get('admin', function(err, admin) {

			handleError(err);

			if(admin) {

				socket.broadcast.emit('controlReleased');

				sync.currentAdmin = '';
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