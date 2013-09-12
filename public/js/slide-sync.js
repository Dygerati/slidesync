(function(){

	var sync;

	function slideSync() {

  		var socket = io.connect('http://localhost:3000/sync');

		if ( arguments.callee._singletonInstance )
    		return arguments.callee._singletonInstance;
  		arguments.callee._singletonInstance = this;

  		sync = this;

  		sync.socket = socket;
  		sync.admin = false;

  		sync.attachEvents();
	}

	slideSync.prototype = {

		attachEvents: function() {

			sync.socket.on('controlAssigned', sync.socketEvents.controlAssignedEvent);
	  		sync.socket.on('controlReleased', sync.socketEvents.controlReleasedEvent);
	  		sync.socket.on('navigateTo', sync.socketEvents.navigateToEvent);

	  		var takeCtrlBtn = document.querySelectorAll('.rsync-take-control');
	  		takeCtrlBtn[0].addEventListener('click', sync.DOMEvents.takeControlClick);

	  		var releaseCtrlBtn = document.querySelectorAll('.rsync-release-control');
	  		releaseCtrlBtn[0].addEventListener('click', sync.DOMEvents.releaseControlClick);

	  		Reveal.addEventListener('slidechanged', sync.socketEvents.slideChangedEvent);
		},	

		socketEvents: {

			controlReleasedEvent: function(){

				sync.makeActiveButton(document.querySelectorAll('.rsync-take-control')[0]);

			},

			slideChangedEvent: function(e){

				if(sync.admin) {
					sync.socket.emit('navigateTo', Reveal.getIndices());
				}

			},

			controlAssignedEvent: function(name) {
				var el = document.querySelectorAll('.rsync-is-controlled')[0];

				el.innerHTML = 'Currently following ' + name;
				
				sync.makeActiveButton(el);

			},

			navigateToEvent: function(index) {

				Reveal.slide(index.h, index.v);

			}

		},

		DOMEvents: {

			takeControlClick: function(e) {
				e.preventDefault();

				var name = sync.retrieveName();

				if(name) {

					sync.socket.emit('takeControl', name);

					sync.makeActiveButton(document.querySelectorAll('.rsync-release-control')[0]);

					sync.admin = true;
					
				}
			},


			releaseControlClick: function(e){
				e.preventDefault();

				sync.socket.emit('releaseControl');

				sync.makeActiveButton(document.querySelectorAll('.rsync-take-control')[0]);

				sync.admin = false;
			}
		},

		retrieveName: function() {
			var name = '';

			//Specifying empty string to allow null values (cancel)
			while(name === '') {
				name = prompt('Please enter your name:');

				if(name === '') {
					alert('You must enter a name to proceed.');
				}

			}

			return name;
		},

		makeActiveButton: function(el) {
			var children = Array.prototype.slice.call(el.parentNode.childNodes).filter(function(child) {

				return (child.nodeType === 1);

			});

			for(var i = 0; i < children.length; i++) {

				var child = children[i];

				child.style.display = 'none';
			}

			el.style.display = 'block'
		}

	};

	window.slideSync = new slideSync();

})();