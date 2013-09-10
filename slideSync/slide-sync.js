
module.exports = function(http) {
	
	var io = require('socket.io').listen(http);

	io.of('/sync').on('connection', function(socket) {
		socket.emit('serverMessage', 'testing123');

		socket.on('takeControl', function(name){
			socket.set('admin', true, function(err) {
				handleError(err);

				socket.broadcast.emit('controlAssigned', name);
			});
		});

		socket.on('releaseControl', function() {

			socket.get('admin', function(err, admin) {

				handleError(err);

				if(admin) {

					socket.set('admin', false);
					socket.broadcast.emit('controlReleased');
				}

			});

		});

		socket.on('navigateTo', function(index){

			socket.get('admin', function(err, admin) {

				handleError(err);

				if(admin) {

					socket.broadcast.emit('navigateTo', index);

				}

			});

		});

	});

	function handleError(err) {

		if(err) {
			console.log('Error: ', err.msg);	
		}
		
	}

}