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
    var colorToNote=[{color:"#CE93D8",note:"C"}, {color:"#01579B",note:"G"},{color:"#FFD45F",hasOwnPropertye:"R"}]//color note tuple
    var scale=[53,55,57,58,60,62,64,65]; //f major scale
    function init(){
        direction="right";
		make_snake();
        make_note();
		
		
		game_loop = setInterval(paint, 60);
        
        song_loop = setInterval(playSnake, 1000);
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
            var snake=musicSnake;
        console.log(snake);
        var duration=1.5;
            var delay = 0; 
			var velocity = 127;
			MIDI.setVolume(0, 127);
        for (var i=0; i<snake.length; i++){
            console.log(snake[i].note);
            MIDI.noteOn(0, snake[i].note, velocity, delay);
			MIDI.noteOff(0, snake[i].note, delay +duration);
            
        }
			
        
        
    }
    //plays a note when it's first eaten
    function playNote(note){
        var delay = 0; // play one note every quarter second
			//var note = food.note; // the MIDI note
			var velocity = 127; // how hard the note hits
			// play the note
			MIDI.setVolume(0, 127);
			MIDI.noteOn(0, note, velocity, delay);
			MIDI.noteOff(0, note, delay + 0.75);
        
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
    
    //making the snake, initialized with a length of 6
	function make_snake(){		
		for(var i =2; i>=0; i--){          
			musicSnake.push({x: i, y:3, color:"red", note:scale[Math.floor(Math.random() * scale.length)]});
		}
	}
	
    
    //makes a single random note
	function make_note(){
        var rand = colorToNote[Math.floor(Math.random() * colorToNote.length)];
        var pitch=scale[Math.floor(Math.random() * scale.length)]

		food = {
			x: Math.round(Math.random()*(width-cellSize)/cellSize), 
			y: Math.round(Math.random()*(height-cellSize)/cellSize), 
            color:rand[0],
            note:pitch,
		};
        //console.log(food);
        
        return food;
	}
	var headColor;
	function paint(){
        //canvas
		ctx.fillStyle = "white";
		ctx.fillRect(0, 0, width, height);
		ctx.strokeStyle = "black";
		ctx.strokeRect(0, 0, width, height);
		
        //redraw tail at head
		var headX = musicSnake[0].x;
		var headY = musicSnake[0].y;
        headColor=musicSnake[0].color;
        //move in the right direction
		if(direction == "right") headX++;
		else if(direction == "left") headX--;
		else if(direction == "up") headY--;
		else if(direction == "down") headY++;
		
		//if hits the end of the canvas or hits itself, end
		if(headX==-1 || headY==-1 || headX==width/cellSize ||  headY ==height/cellSize || check_collision(headX,headY,musicSnake)){
			return;
		}
		
		//if it hits food, increase the length by 1
		if(headX==food.x && headY==food.y){
			var tail={x: headX, y: headY};
            var delay = 0; // play one note every quarter second
			var note = food.note; // the MIDI note
			var velocity = 127; // how hard the note hits
			// play the note
			MIDI.setVolume(0, 127);
			MIDI.noteOn(0, note, velocity, delay);
			MIDI.noteOff(0, note, delay + 0.75);
			score++;
            make_note();
		}
		else{
			var tail = musicSnake.pop(); //pops out the last cell
			tail.x = headX;
            tail.y = headY;
            tail.color="red";
            tail.note=scale[Math.floor(Math.random() * scale.length)];
		}
		musicSnake.unshift(tail);
        
		for(var i = 0; i < musicSnake.length; i++){
			var c = musicSnake[i];
			//Lets paint 10px wide cells
			color_note(c.x, c.y);
		}
		
		//Lets paint the food
		color_note(food.x, food.y);
		//Lets paint the score
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
    
    //Colors the notes
	function color_note(x, y){
		ctx.fillStyle = "blue";
		ctx.fillRect(x*cellSize, y*cellSize, cellSize, cellSize);
		ctx.strokeStyle = "white";
		ctx.strokeRect(x*cellSize, y*cellSize, cellSize, cellSize);
	}
	
	
	
	
	
	
	
	
	
})

