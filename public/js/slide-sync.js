(function(){

	var rS;

	function slideSync() {

		if ( arguments.callee._singletonInstance )
    		return arguments.callee._singletonInstance;
  		arguments.callee._singletonInstance = this;

  		rS = this;

  		var socket = io.connect('http://localhost:3000/sync');

  		socket.on('controlAssigned', rS.controlAssignedEvent);
  		socket.on('controlReleased', rS.controlReleasedEvent);
  		socket.on('navigateTo', rS.navigateToEvent);

  		$('.rsync-take-control').on('click', rS.takeControlClick);
  		$('.rsync-release-control').on('click', rS.releaseControlClick);

  		Reveal.addEventListener('slidechanged', rS.slideChangedEvent);

  		rS.socket = socket;
  		rS.admin = false;
	}

	slideSync.prototype = {

		takeControlClick: function(e) {
			e.preventDefault();

			var name = rS.retreiveName();

			if(name) {

				rS.socket.emit('takeControl', name);

				$('.rsync-release-control').makeActiveButton();

				rS.admin = true;
				
			}
		},


		releaseControlClick: function(e){
			e.preventDefault();

			rS.socket.emit('releaseControl');

			$('.rsync-take-control').makeActiveButton();

			rS.admin = false;
		},


		controlAssignedEvent: function(name) {

			$('.rsync-is-controlled').text('Currently following ' + name)
				.makeActiveButton();

		},

		controlReleasedEvent: function(){

			$('.rsync-take-control').makeActiveButton();

		},

		slideChangedEvent: function(e){

			if(rS.admin) {
				rS.socket.emit('navigateTo', Reveal.getIndices());
			}

		},

		navigateToEvent: function(index) {

			Reveal.slide(index.h, index.v);

		},

		retreiveName: function() {
			var name = '';

			//Specifying empty string to allow null values (cancel)
			while(name === '') {
				name = prompt('Please enter your name:');

				if(name === '') {
					alert('You must enter a name to proceed.');
				}

			}

			return name;
		}

	};

	window.slideSync = new slideSync();

	$.fn.makeActiveButton = function() {
		var el = $(this);

		el.removeClass('hide')
			.siblings()
			.addClass('hide');
	};

})();