(function( $ ) {
	$.fn.reverse = [].reverse;
	$.fn.flyout = function(opts) {
		//"this" should be a main container, all immediate children should be buttons. A UL and LI's work well.
		var defaults = {
			radius: '100', //How large the circle of buttons should be when open. Default: 100
			totalDegrees : '360', //How far around the circle of buttons should go. Default: 360
			offsetx : '0', //How far along the x axis to offset the flyout circle. Default: 0
			offsety : '0', //How far along the x axis to offset the flyout circle. Default: 0
			angleOffset : '0', //What angle to start the circle at. 0 is the top. Default: 0
			duration : '400', //How long it takes each button to reach its final destination (in ms). Default: 400
			delay : '100', //Time between buttons. This causes the cascade effect. Default: 100
			startRotation: '-180', //The rotation angle the buttons are at before they start moving. Default: -180
			endRotation: '-360', //The rotation angle the buttons are at when they reach their destination. This should probably be a multiple of 360 (or 0). Default: -360
			flyoutSizePercent: '60', //What percentage of the main button size the smaller buttons are. Default: 75
			reverseOut: 'false', //Whether the buttons should disappear in the opposite order they came out. Default: false
			reverseIn: 'false',		//Whether the buttons should disappear in the opposite order they came out. Default: false
			modalBGColor: 'rgba(255,255,255,0.5)', //What color/opacity the modal BG should be when the buttons are out. Default: rgba(255, 255, 255, 0.5)
			hardcoreMode: 'false' //Use the cool flyout modal background or not. Default is false
		};
		

		var options = $.extend(defaults, opts);
		
		
		return this.each(function(){
			$this = $(this);
			$this.css({'z-index':'10000'});

			//Find the dimensions of the targeted container
			var parentWidth = $this.width(), parentHeight = $this.height();
			btns = $this.children().not("#mainButton");
			console.log(parentWidth, parentHeight, btns);

			$this.wrap('<div class="buttonContainer">').parent().css({'width':parentWidth, 'height':parentHeight});
			$this.parent().data('flyoutOpts', options);
			$this.parent().css({'z-index':'10000'});

			//Size the main button based on the size of the flyout container
			mainButton = $("#mainButton", $this);
			mainButton.width(parentWidth);
			mainButton.height(parentHeight);
			mainButton.children().css({'width':'100%'});
			
			//Position the Main Button - Should already be centered because it's now the same size as the container.
			mainButton.css({'position':'absolute', 'top':'0', 'left':'0'});
			
			//Size the flyout buttons based on the parameter above and the size of the main button
			btns.width(mainButton.width()*options.flyoutSizePercent/100);
			btns.height(mainButton.height()*options.flyoutSizePercent/100);
			btns.children("img").css({'width':'100%'});
			
			
			function findFlyoutCenter(){
				var flyoutWidth, flyoutHeight, flyoutLeft, flyoutTop;
				flyoutWidth = $this.outerWidth();
				flyoutHeight = $this.outerHeight();
				flyoutLeft = $this.offset().left;
				flyoutTop = $this.offset().top;
				centerX = flyoutLeft + flyoutWidth/2;
				centerY = flyoutTop + flyoutHeight/2;
				center = {'left':centerX, 'top': centerY};
				return center;
			}
			
			//Center and position: absolute the flyout buttons behind the main button:
			btnCSS = {
				'position':'absolute',
				'margin-left':function(){
					thisWidth = $(this).width();
					marginLeft = (parentWidth - thisWidth)/2;
					return marginLeft;
				},
				'margin-top':function(){
					thisHeight = $(this).height();
					marginTop = (parentHeight - thisHeight)/2;
					return marginTop;
				}
			};
			btns.css(btnCSS);
			
			btns.on('load', 'img', function(){
				btns.css(btnCSS);
			});
			
			
			//Set up our new stylesheet
			$("style[title='flyout']").remove();
			$("head").append("<style type='text/css' title='flyout'></style>");
			$flyoutStyle = $("style[title='flyout']");
			
			
			
			//Here's where some math happens. First, figure out the angle between buttons based on how many buttons there will be:
			if(options.totalDegrees > 270){
				count = btns.length;
			}
			else{
				count = btns.length -1;
			}
			
			var angleDeg = options.totalDegrees / count ;
			//Convert to radians
			var angleRad = angleDeg * (Math.PI/180);
			
			
			//See if the radius is in percent. If it is, calculate the radius based on the size of the parent container (width or height, whichever is smallest).
			if(options.radius.indexOf("%")>-1){
				if($this.parent().height() < $this.parent().width()){
					parentSize = $this.parent().height();
				}
				else{
					parentSize = $this.parent().width();
				}
				radius = parentSize * parseFloat(options.radius.substring(0,options.radius.indexOf("%")))/100;
			}
			else{
				radius = parseFloat(options.radius);
			}
			
			
			//Our first point will go at the very top. That is, at 0,radius.
			var currentx = 0, currenty = -radius;
			
			//Or, it'll get rotated from that position, if we've got an angleOffset set:
			var angleOffsetRad = options.angleOffset * (Math.PI/180);
			var newx = Math.cos(angleOffsetRad) * currentx + -Math.sin(angleOffsetRad) * currenty;
			var newy = Math.sin(angleOffsetRad) * currentx + Math.cos(angleOffsetRad) * currenty;
			currentx = newx;
			currenty = newy;

			var buttonCSS = ".flyoutButton {-moz-transition: all "+options.duration+"ms; -webkit-transition: all "+options.duration+"ms; -moz-transform:rotate("+options.startRotation+"deg); -webkit-transform:rotate("+options.startRotation+"deg); top: 0; left: 0;}\r\n";
			$flyoutStyle.append(buttonCSS);
			
			/*
			//Iterate through the children of the offset container and get them ready for action
			btns.each(function(i){
				var $this = $(this);
				//Set up the rest of our variables
				var buttonWidth = $this.width(), buttonHeight = $this.height();
				//Create our style sheet and append it to our runtime style
				if($this.attr("id")){
					itemID = $this.attr("id");
				}
				else{
					itemID = "flyout"+i;
					$this.attr("id",itemID);
				}	
			});
			*/
			
			/*Add modal overlay. Disabled for now.
			if(options.hardcoreMode === 'true'){
				// Circular modal flyout - animated
				//add the modal BG
				$('body').append('<div id="modalCoverContainer"><div id="modalCover"></div></div>');
			
				btns.children('img').load(function(){
					modalCenter = findFlyoutCenter();
					$('#modalCoverContainer').css(modalCenter);
				});
			
				// Set it up
				modalAnimateTime = parseFloat(options.delay) * btns.length + parseFloat(options.duration);
				// position: fixed fixed the safari bug on ipad, but now the animation goes crazy
				modalCSS = "#modalCoverContainer{-moz-transition: all " + modalAnimateTime + "ms; transition: all " + modalAnimateTime + "ms; -webkit-transition: all " + modalAnimateTime + "ms; width: 0; height: 0; position: fixed;}\r\n";
				modalCSS += "#modalCover{width: 100%; height:100%;margin-left: -50%; margin-top: -50%;background-color:"+options.modalBGColor+";-webkit-border-radius: 2000px;border-radius: 2000px;}\r\n";
				modalCSS += "#modalCoverContainer.open{width: 4000px; height: 4000px;}\r\n";
				$flyoutStyle.append(modalCSS);
		
				$(window).resize(function(){
					modalCenter = findFlyoutCenter();
					$('#modalCoverContainer').css(modalCenter);
				});
			}
			else{
				modalAnimateTime = parseFloat(options.delay) * btns.length + parseFloat(options.duration);
				$('body').append('<div id="modalCoverContainer"></div>');
				modalCSS = "#modalCoverContainer{-moz-transition: all " + modalAnimateTime + "ms; transition: all " + modalAnimateTime + "ms; -webkit-transition: all " + modalAnimateTime + "ms; width: 100%; height:100%;background-color:"+options.modalBGColor+"; opacity: 0; pointer-events:none; display: block; position: fixed; top: 0; left: 0; z-index: 100;}\r\n";
				modalCSS += "#modalCoverContainer.open{opacity: 1; pointer-events: auto;}\r\n";
				$flyoutStyle.append(modalCSS);
			}
			*/
			
			btns.each(function(i){
				var $this = $(this), buttonTop = currenty - parseFloat(options.offsety), buttonLeft = currentx + parseFloat(options.offsetx);
				$this.addClass("flyoutButton");
				if($this.attr("id")){
					itemID = $this.attr("id");
				}
				else{
					itemID = "flyout"+i;
					$this.attr("id",itemID);
				}
				var openCSS = "#"+itemID+".open{top: "+buttonTop+"px; left: "+buttonLeft+"px; -moz-transform:rotate("+options.endRotation+"deg); -webkit-transform:rotate("+options.endRotation+"deg);}\r\n";
				$flyoutStyle.append(openCSS);
				//Now let's do some rotation math. Hooray!
				newx = Math.cos(angleRad) * currentx + -Math.sin(angleRad) * currenty;
				newy = Math.sin(angleRad) * currentx + Math.cos(angleRad) * currenty;
				currentx = newx;
				currenty = newy;
			});
			
			
			function openFlyout(clickedEl){
				if(options.reverseOut.toLowerCase() === "true"){var toggleButtons = $(".flyoutButton").reverse();}
				else{var toggleButtons = $(".flyoutButton");}
				/*$("#modalCoverContainer").addClass("open");
				$("#modalCoverContainer").one('click', function(){
					$("#mainButton").click();
				});*/
				toggleButtons.each(function(i){
					var $button = $(this);
					var delayTime = i * options.delay;
					window.setTimeout(function(){
						$button.addClass("open");},delayTime);
				});
				clickedEl.one('click.flyout', function(){
					console.log("closing");
					closeFlyout($(this));
				});
			}

			function closeFlyout(clickedEl){
				if(options.reverseIn.toLowerCase() === "true"){var toggleButtons = $(".flyoutButton").reverse();}
				else{var toggleButtons = $(".flyoutButton");}
				//$("#modalCoverContainer").removeClass("open");
				toggleButtons.each(function(i){
					var $button = $(this);
					var delayTime = i * options.delay;
					window.setTimeout(function(){
						$button.removeClass("open");},delayTime);
				});
				clickedEl.one('click.flyout', function(){
					console.log("opening!");
					openFlyout($(this));
				})
			}

			//Do stuff when the button is clicked.
			$("#mainButton").one('click.flyout', function(){
				console.log("clicked!");
				openFlyout($(this));
			});
		});
	};


})( jQuery );
