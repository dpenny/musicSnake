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
    
    var colorToNote=[{color:"#F48FB1",note:53},{color:"#C51162",note:55},{color:"#7B1FA2",note:57},{color:"#3F51B5",note:58}, {color:"#7986CB",note:60},{color:"#006064",note:62},{color:"#9ccc65",note:64}, {color:"#FFEE58",note:65}]//color note tuple
   var pitchToColor= {
      "53":"#F48FB1" ,  "55":  "#C51162", "57": "#7B1FA2" , "58": "#3F51B5", "60":"#7986CB" , "62": "#006064", "64":"#9ccc65" , "65": "#FFEE58"
        
        };
    var scale=[53,55,57,58,60,62,64,65]; //f major scale
    
    var pitchList=[];
    function init(){
        direction="right";
		make_snake();
        make_note();	
		game_loop = setInterval(paint, 60);    
        song_loop = setInterval(playSnake, 3000);
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
        console.log(pitchList, "list of pitches to play");
        var duration=0.0;
            var delay = .50; 
			var velocity = 127;
			MIDI.setVolume(0, 127);
        for (var i=0; i<pitchList.length; i++){
            console.log(pitchList[i]);
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
        
		if(letter=="37"){
            direction="left";
        }
        else if(letter=="39"){
            direction="right";
        }
        else if(letter=="38"){
            direction="up";
        }
        else if(letter=="40"){
            direction="down";
        };
		
	})
    
    //making the snake, initialized with a length of 3
	function make_snake(){		
		for(var i =2; i>=0; i--){          
            var pitch=scale[Math.floor(Math.random() * scale.length)];
            pitchList.push(pitch);
			musicSnake.push({x: i, y:3, color:"cats", note:pitch});
		}
	}
	
    
    //makes and returns a single random note
	function make_note(){
        var rand = colorToNote[Math.floor(Math.random() * colorToNote.length)];
        var pitch=scale[Math.floor(Math.random() * scale.length)]

		food = {
			x: Math.round(Math.random()*(width-cellSize)/cellSize), 
			y: Math.round(Math.random()*(height-cellSize)/cellSize), 
            color:rand[0],
            note:pitch,
		};
        console.log(availableNotes, "food list");
        availableNotes.push(food);
        return food;
	}

    function paint(){
        //canvas
		ctx.fillStyle = "white";
		ctx.fillRect(0, 0, width, height);
		ctx.strokeStyle = "black";
		ctx.strokeRect(0, 0, width, height);
		
		var headX = musicSnake[0].x;
		var headY = musicSnake[0].y;
        var headColor=musicSnake[0].color;
        var headPitch=musicSnake[0].pitch;
        //move in the right direction
		if(direction == "right") headX++;
		else if(direction == "left") headX--;
		else if(direction == "up") headY--;
		else if(direction == "down") headY++;
		
		//if hits the end of the canvas or hits itself, end
		if(headX==-1 || headY==-1 || headX==width/cellSize ||  headY ==height/cellSize || check_collision(headX,headY,musicSnake)){
			return;
		}
		
        
		if(headX==food.x && headY==food.y){
			var tail={x: headX, y: headY};
            var delay=0;
			var note=food.note; 
			var velocity = 127; 
			// play the note
			MIDI.setVolume(0, 127);
			MIDI.noteOn(0, note, velocity, delay);
			MIDI.noteOff(0, note, delay + 1.75);
			score++;
            pitchList.push(note);
            make_note();
		}
        //no food eaten- move tail to head
		else{
			var tail = musicSnake.pop(); //pops out the last cell
			tail.x = headX;
            tail.y = headY;
            tail.color="no";
            tail.note=headPitch;
		}
		musicSnake.unshift(tail);
        //draw the snake
		for(var i = 0; i < musicSnake.length; i++){
			var c = musicSnake[i];
			color_note(c.x, c.y);
		}
		color_note(food.x, food.y);
        //draw the notes
		//for(var i = 0; i < availableNotes.length; i++){
		//	var f = availableNotes[i];
		//	color_note(f.x, f.y);
		//}
		
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
		ctx.fillStyle = "blue";
		ctx.fillRect(x*cellSize, y*cellSize, cellSize, cellSize);
		ctx.strokeStyle = "white";
		ctx.strokeRect(x*cellSize, y*cellSize, cellSize, cellSize);
	}
    
    //Colors pitches with different colors- will replace color_note
	function color_note(x, y, color){
		ctx.fillStyle = "blue";
		ctx.fillRect(x*cellSize, y*cellSize, cellSize, cellSize);
		ctx.strokeStyle = color;
		ctx.strokeRect(x*cellSize, y*cellSize, cellSize, cellSize);
	}
	
	
	
	
	
	
	
	
	
	
})

