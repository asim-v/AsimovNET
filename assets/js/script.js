var Network = function()
{


	this.iDots 			= ( oSize.w * oSize.h ) / 2000;
	this.aDots 			= [];
	this.maxLine		= 7;
	this.oLines			= {};
	this.bRepulse		= true;
	this.iDist 			= 80;




	Network.prototype.build = function()
	{

		this.aDots 			= [];
		this.iDots 			= ( oSize.w * oSize.h ) / 2000;

		for (var i = 0; i < this.iDots; i++) {
			
			this.addDot();

		};


		this.updateLine();

	};


	Network.prototype.addDot = function()
	{

		var oDot = {

			x 		: 	rand( 0, ( oSize.w - 10 ) ),
			y 		: 	rand( 0, ( oSize.h - 10 ) ),
			r 		: 	rand( 0.5, 2 ) + 0.1, //radius
			a 		:   0,	//alpha
			ta 		:   rand( 2, 8 ),//targeted alpha
			link 	: 	0,
			life 	: 	rand( 3, 10 ),
			dist 	: 	rand( 300, 600 ),
			speed 	: 	rand( 5, 30 ) / 200
		};

		oDot.ta = oDot.ta / 10;
		oDot.tx = rand( oDot.x - oDot.dist, oDot.x + oDot.dist );
		oDot.ty = rand( oDot.y - oDot.dist, oDot.y + oDot.dist );


		this.aDots.push( oDot );

	};

	Network.prototype.addLine = function( start, end, dist, sName )
	{


		var oLine = {

			sx 		: start.x,
			sy 		: start.y,
			tx 		: end.x,
			ty 		: end.y,
			da 		: ( ( 100 - ( ( dist * 100 ) / this.iDist ) ) / 100 ) 

		};

		//find the lowest alpha
		if( start.a < end.a ){
			
			if( start.a < oLine.da )
				oLine.a = start.a;
			else
				oLine.a = oLine.da;
		
		}else{

			if( end.a < oLine.da )
				oLine.a = end.a;
			else
				oLine.a = oLine.da;
		
		}

		this.oLines[ sName ] =  oLine;

		start.link++;
		end.link++;


	}



	Network.prototype.getDist = function( dot1, dot2 )
	{

		var dx = dot1.x - dot2.x;
		var dy = dot1.y - dot2.y;
		var distance = Math.sqrt(dx * dx + dy * dy);

		return distance;

	}

	Network.prototype.checkMouse = function( dot )
	{

		var radius = 200;	
		// detection collision circle
		var dx = oMouse.x - dot.x;		
		var dy = oMouse.y - dot.y;
		var distance = Math.sqrt(dx * dx + dy * dy);

		if ( distance < radius)
			return true;
		else
			return false;
		
	}









	Network.prototype.updateDot = function()
	{

		for (var i = this.aDots.length - 1; i >= 0; i--) {

			//decrease his life
			this.aDots[i].life -= 0.02;
			//reset link
			this.aDots[i].link = 0;


			//in the mouse attraction
			if( this.checkMouse( this.aDots[i] ) ){

				//update position
			var tx = oMouse.x - this.aDots[i].x,
				ty = oMouse.y - this.aDots[i].y,
				dist = Math.sqrt(tx * tx + ty * ty);

				if( this.bRepulse ){
				
					if ( dist >= ( this.aDots[i].speed * 3 ) ) {

						velX = (tx / dist) * ( this.aDots[i].speed * 3 );
						velY = (ty / dist) * ( this.aDots[i].speed * 3 );
						this.aDots[i].x -= velX;
						this.aDots[i].y -= velY;

					}

				}else{

					if ( dist >= ( this.aDots[i].speed * 6 ) ) {

						velX = (tx / dist) * ( this.aDots[i].speed * 6 );
						velY = (ty / dist) * ( this.aDots[i].speed * 6 );
						this.aDots[i].x += velX;
						this.aDots[i].y += velY;

					}

				}


			}else{//not in


				//update position
			var tx = this.aDots[i].tx - this.aDots[i].x,
				ty = this.aDots[i].ty - this.aDots[i].y,
				dist = Math.sqrt(tx * tx + ty * ty);

				if ( dist >= this.aDots[i].speed ) {

					velX = (tx / dist) * this.aDots[i].speed;
					velY = (ty / dist) * this.aDots[i].speed;
					this.aDots[i].x += velX;
					this.aDots[i].y += velY;

				}


			}


			//if gonna die
			if( this.aDots[i].life <= 0 ){

				
				//if no alpha, you die
				if( this.aDots[i].a <= 0 ){
					//good bye my friend
					this.aDots.splice( i, 1 );
					//her the new choosen one
					this.addDot();
				}else{
					//decrease his alpha
					this.aDots[i].a -= 0.005;
				}
			//if not gonna die
			}else{
				//and you just born, you can appear my baby
				if( this.aDots[i].a <= this.aDots[i].ta )
					this.aDots[i].a += 0.005;

			}

		};

	}





	Network.prototype.updateLine = function()
	{

		this.oLines = {};

		//build lines
		for (var i = 0; i < this.aDots.length; i++) {

			for (var j = ( i + 1 ) ; j < this.aDots.length; j++) {

				var aDotedDist = this.getDist( this.aDots[i], this.aDots[j] );
				var sName = this.aDots[i].x + this.aDots[i].y + this.aDots[j].x + this.aDots[j].y;

				if( aDotedDist < this.iDist && typeof this.oLines[ sName ] === 'undefined' && j > i )
					this.addLine(  this.aDots[i], this.aDots[j], aDotedDist, sName  );

			}
	
		};


	};



	Network.prototype.update = function()
	{

		this.updateDot();
		this.updateLine();

	};



	Network.prototype.drawLines = function( ctx )
	{

		for ( var key in this.oLines ){

			var l = this.oLines[key];

			ctx.beginPath();
			ctx.moveTo( l.sx, l.sy );
			ctx.lineTo( l.tx, l.ty );
			ctx.lineWidth = 0.2;
			ctx.strokeStyle = "rgba( 0, 0, 0, " + l.a + ")";
			ctx.stroke();
			

		};

	};

	Network.prototype.drawDots = function( ctx )
	{

		for (var i = this.aDots.length - 1; i >= 0; i--) {

			var d = this.aDots[i];

			ctx.beginPath();
			ctx.arc( d.x, d.y, d.r, 0, 2 * Math.PI, false);
			ctx.fillStyle = 'rgba( 0, 0, 0, ' + d.a + ' )';
      		ctx.fill();

		};

	};

	Network.prototype.draw = function( ctx )
	{

		this.drawLines( ctx );
		this.drawDots( ctx );

	};









}
















/** global vars **/
var oSize 		= {
	h : window.innerHeight,
	w : window.innerWidth
};
var oMouse 		= {
	x : oSize.w / 2,
	y : oSize.h / 2
};

var canvas 		= document.getElementById('network');
var ctx	 		= canvas.getContext('2d');

canvas.height 	= oSize.h;
canvas.width 	= oSize.w;


var bPersiste = false;
rand = function( min, max ){ return Math.random() * ( max - min) + min; };
update_mouse = function( _e ){ oMouse.y = _e.pageY; oMouse.x = _e.pageX; };
onresize = function () { oSize.w = canvas.width = window.innerWidth; oSize.h = canvas.height = window.innerHeight; oNetwork.build(); };
merge = function(o1,o2){var o3 = {};for (var attr in o1) { o3[attr] = o1[attr]; }for (var attr in o2) { o3[attr] = o2[attr]; }return o3;}
attract = function(){ oNetwork.bRepulse = false; };
repusle = function(){ oNetwork.bRepulse = true; };
persist = function(){ bPersiste = !bPersiste; };
var oNetwork = new Network();

document.addEventListener('mousemove', update_mouse, false);
document.addEventListener('onresize', onresize, false);
document.addEventListener('mousedown', attract, false);
document.addEventListener('mouseup', repusle, false);
document.addEventListener('click', persist, false);
window.onresize(); 




oNetwork.build();


/** ANIMATION **/
function render(){

	if( bPersiste ){

		ctx.fillStyle = "rgba( 255, 255, 255, 0.01 )";
		ctx.fillRect( 0, 0, oSize.w, oSize.h );

	}else{	
		
		//ctx.clearRect(0, 0, oSize.w, oSize.h );
		ctx.fillStyle = "rgba( 255, 255, 255, 1 )";
		ctx.fillRect( 0, 0, oSize.w, oSize.h );

	}
	

	oNetwork.update();

	oNetwork.draw( ctx );

	requestAnimationFrame( render );

}
render();