$(document).ready(function(){

    var canvas=$("#canvas")[0];
	var ctx=canvas.getContext("2d");
	var width=$("#canvas").width();
	var height=$("#canvas").height();
	
	var cellSize=20;
	var direction; 
	var notes;
	var score=0;
	
	var musicSnake=[]; //array of notes in the snake
	var availableNotes=[]; //array of notes/food currently on the canvas
    

   var pitchToColor= {
      "53":"#F48FB1" ,  "55":  "#C51162", "57": "#7B1FA2" , "58": "#3F51B5", "60":"#7986CB" , "62": "#006064", "64":"#9ccc65" , "65": "#FFEE58"
        
        };
    var scale=[53,55,57,58,60,62,64,65]; //f major scale
    
    var pitchList=[]; //list of notes in the snake
    var oldPitchListLen=3; //number of notes from cycle before
    function init(){
        direction="right";
		make_snake();
        make_note();

        game_loop = setInterval(paint, 60);    

        var counter = 1500;
        var myFunction = function(){
    clearInterval(interval);
        var numAddedNotes=pitchList.length-oldPitchListLen;
    counter +=(500*numAddedNotes); //increases interval if a new note has been added
    oldPitchListLen=pitchList.length;
    playSnake();
    interval = setInterval(myFunction, counter);
}
var interval = setInterval(myFunction, counter);
        
    }
	
	   
    MIDI.loadPlugin({
		soundfontUrl: "./soundfont2/",
		instrument: "acoustic_grand_piano",
		onprogress: function(state, progress) {
			//console.log(state, progress);
		},
		onsuccess: function() {
            midiLoaded=true;
            init();
            
		}
	});
    
    //plays the snake built so far
    function playSnake(){
        var duration=0.0;
            var delay = .50; 
			var velocity = 127;
			MIDI.setVolume(0, 127);
        for (var i=0; i<pitchList.length; i++){
            MIDI.noteOn(0, pitchList[i], velocity, delay);
			MIDI.noteOff(0, pitchList[i], delay +duration);
            delay=delay+.5;
            
        }
    }
			 
    //plays a note when it's first eaten
    function playNote(note,duration){
        var delay = 0;
			var velocity = 127;
			MIDI.setVolume(0, 127);
			MIDI.noteOn(0, note, velocity, delay);
			MIDI.noteOff(0, note, delay + duration);
        
    }
	 
	//Moving the snake
	$(document).keydown(function(e){
		var letter=e.which;
        
		if(letter=="37" && direction!="right"){
            direction="left";
        }
        else if(letter=="39" && direction!="left"){
            direction="right";
        }
        else if(letter=="38" && direction!="down"){
            direction="up";
        }
        else if(letter=="40" && direction!="up"){
            direction="down";
        };
		
	})
    
    //making the snake, initialized with a length of 3
	function make_snake(){		
		for(var i =2; i>=0; i--){          
            var pitch=scale[Math.floor(Math.random() * scale.length)];
            pitchList.push(pitch);
			musicSnake.push({x: i, y:3, color:"#f42ada", pitch:pitch});
		}
	}
	
    
    //makes and returns a single random note
	function make_note(){
        //var rand = colorToNote[Math.floor(Math.random() *colorToNote.length)];
        var pitchhhh=scale[Math.floor(Math.random() * scale.length)]
		food = {
			x: Math.round(Math.random()*(width-cellSize)/cellSize), 
			y: Math.round(Math.random()*(height-cellSize)/cellSize), 
            color:pitchToColor[pitchhhh.toString()],
            pitch:pitchhhh,
		};
        availableNotes.push(food);
        return food;
	}
var headColor;
    function paint(){
		ctx.fillStyle = "white";
		ctx.fillRect(0, 0, width, height);
		ctx.strokeStyle = "black";
		ctx.strokeRect(0, 0, width, height);
		var headX = musicSnake[0].x;
		var headY = musicSnake[0].y;
        var headPitch=musicSnake[0].pitch;
         headColor= pitchToColor[headPitch.toString()];
        
        //move in the right direction
		if(direction == "right") headX++;
		else if(direction == "left") headX--;
		else if(direction == "up") headY--;
		else if(direction == "down") headY++;
		
		//if hits the end of the canvas or hits itself, end
		if(headX==-1 || headY==-1 || headX==width/cellSize ||  headY ==height/cellSize || check_collision(headX,headY,musicSnake)){
			return;
		}
		
        //if it eats a note
		if(headX==food.x && headY==food.y){
			var tail={x: headX, y: headY, pitch:headPitch, color:"green"}; 
            var delay=0;
			var note=food.pitch; 
			var velocity = 127; 
			MIDI.setVolume(0, 127);
			MIDI.noteOn(0, note, velocity, delay);
			MIDI.noteOff(0, note, delay + 1.75);
			score++;
            var gonefood=availableNotes.indexOf(food);
            if (gonefood > -1) {
    availableNotes.splice(gonefood, 1);
}
            make_note();

            
		}
        //no food eaten- move tail to head
		else{
			var tail = musicSnake.pop(); //pops out the last cell
			tail.x = headX;
            tail.y = headY;
            tail.pitch=headPitch;
            tail.color="yellow";
		}
		musicSnake.unshift(tail);
        //draw the snake
		for(var i = 0; i < musicSnake.length; i++){
			var c = musicSnake[i];
			color_note(c.x, c.y);
		}
        color_pitch(food.x, food.y, food.color);
        //console.log(availableNotes.length);
		

        var score_text = "Score: " + score;
		ctx.fillText(score_text, 5, height-5)
	}
	
	
	function check_collision(x, y, array){
        for(var i = 0; i < array.length; i++){
			if(array[i].x==x && array[i].y==y)
                
			 return true;
		}
		return false;
	}
    
    //Colors notes
	function color_note(x, y){
		ctx.fillStyle = headColor;
		ctx.fillRect(x*cellSize, y*cellSize, cellSize, cellSize);
		ctx.strokeStyle = "white";
		ctx.strokeRect(x*cellSize, y*cellSize, cellSize, cellSize);
	}
    
    //Colors pitches with different colors- will replace color_note
	function color_pitch(x, y, color){
		ctx.fillStyle = color;
		ctx.fillRect(x*cellSize, y*cellSize, cellSize, cellSize);
		ctx.strokeStyle = color;
		ctx.strokeRect(x*cellSize, y*cellSize, cellSize, cellSize);
	}
	
	
	
	
	
	
	
	
	
	
})

