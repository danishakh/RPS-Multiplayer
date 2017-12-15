// Initialize Firebase
var config = {
apiKey: "AIzaSyCK25zK30DCMUV_v_t2G23MkVF_xH0Zl1M",
authDomain: "rps-multiplayer-96682.firebaseapp.com",
databaseURL: "https://rps-multiplayer-96682.firebaseio.com",
projectId: "rps-multiplayer-96682",
storageBucket: "rps-multiplayer-96682.appspot.com",
messagingSenderId: "583803410216"
};

firebase.initializeApp(config);

// Reference to firebase db
var db = firebase.database();



// Global Variables
// Max No. of Players
var maxPlayers = 2;

var player1 = null;
var player2 = null;

// Player Exists
var player1Exists = false;
var player2Exists = false;
var player1Name = "";
var player2Name = "";

var myPlayerName = "";

var turn = 1;

// Game State
var gameStates = ['open', 'ready', 'done']; 
var playerStates = ['ready', 'picked'];

// Player Ref Paths
var playersRefPath = '/players';
var player1RefPath = '/players/1';
var player2RefPath = '/players/2';
var gameRefPath = '/game';


// hide rock paper scissors button when page loads
$("#buttons-view").hide();



db.ref(playersRefPath).on('value', function(snapshot) {
	// console.log(snapshot.child('1').val()); //presents child '1' object under '/players' node
	// console.log(snapshot.child('2').val());	//presents child '2' object under '/players' node

	// console.log('players node exists: ' + snapshot.exists());	//true if players node exists
	// console.log('/players/1 node exists: ' + snapshot.child('1').exists());	// true if '/players/1' node exists
	// console.log('/players/2 node exists: ' + snapshot.child('2').exists());	// true if '/players/2' node exists

	// console.log('/players node has ' + snapshot.numChildren() + ' children'); // returns number of children node for 'players'


	// if '/players' exists
	if (snapshot.exists()){

		//check if player1 exists
		if (snapshot.child('1').exists()) {
			//console.log("player1 exists");
			player1Exists = true;

			// store player1 object
			player1 = snapshot.child('1').val();
			player1Name = player1.name;

			//update player1 card
			$(".player1").text(player1Name);
			$(".player1-stats").empty();
			var statsList = $("<ul><li id='wins' >Wins: " + player1.wins + 
				"</li> <li id='losses'>Losses: " + player1.losses + 
				"</li> <li id='streak'>Best Streak: " + player1.streak + "</li></ul>");
			$(".player1-stats").append(statsList);

			db.ref(gameRefPath+'/player1').set(player1Name);
		}
		else {
			console.log('player1 does not exist');
			player1Exists = false;

			player1 = null;
			player1Name = "";

			//update player1 card
			$(".player1").text("Waiting for Player 1...");
			$(".player1-stats").empty();
			var statsList = $("<ul><li id='wins' >Wins: 0" + 
				"</li> <li id='losses'>Losses: 0"  +
				"</li> <li id='streak'>Best Streak: 0</li></ul>");
			$(".player1-stats").append(statsList);

		}

		//check if player2 exists
		if (snapshot.child('2').exists()) {
			//console.log("player2 exists");
			player2Exists = true;

			//store player2 object
			player2 = snapshot.child('2').val();
			player2Name = player2.name;

			//update player2 card
			$(".player2").text(player2Name);
			$(".player2-stats").empty();
			var statsList = $("<ul><li id='wins' >Wins: " + player2.wins + 
				"</li> <li id='losses'>Losses: " + player2.losses + 
				"</li> <li id='streak'>Best Streak: " + player2.streak + "</li></ul>");
			$(".player2-stats").append(statsList);

			db.ref(gameRefPath+'/player2').set(player2Name);
		}
		else {
			console.log('player2 does not exist');
			player2Exists = false;

			player2 = null;
			player2Name = "";

			//update player2 card
			$(".player2").text("Waiting for Player 2...");
			$(".player2-stats").empty();
			var statsList = $("<ul><li id='wins' >Wins: 0" + 
				"</li> <li id='losses'>Losses: 0"  +
				"</li> <li id='streak'>Best Streak: 0</li></ul>");
			$(".player2-stats").append(statsList);
		}

		if(player1 && player2) {
			console.log('player1 and player2 exist');

			// player1 = snapshot.child('1').val();
			// player1Name = player1.name;

			// player2 = snapshot.child('2').val();
			// player2Name = player2.name;

			db.ref(gameRefPath+'/state').set(gameStates[1]);
			//READY TO START GAME 
			//ALLOW PLAYER 1 TO CHOOSE AN OPTION!

			//$(".result-card").text('Game is ready to start - Player 1 Turn');

		}

		if (!player1 && !player2) {
			//no players in the game
			console.log('no players exists');
			db.ref(gameRefPath).remove();

			db.ref(playersRefPath).remove();

			$(".result-card").text('Waiting for players');
		}
	}
});

// check to detect if player disconnected
db.ref(playersRefPath).on("child_removed", function(snapshot) {
	console.log(snapshot.val());
	var msg = snapshot.val().name + " has disconnected";

	//get a key for the disconnection chat entry
	var chatKey = db.ref().child("/chat/").push().key;

	// save the disconnection chat entry
	db.ref("/chat/" + chatKey).set(msg);
});


db.ref(gameRefPath).on('value', function(snapshot) {
	if (snapshot.exists()){
		var game = snapshot.val();
		console.log(game);

		if((player1 && player2) && (game.state == "ready")) {
			$("#buttons-view").show();

			if(snapshot.val().turn == 1){
				console.log('player 1 - turn');
				turn = 1;

				$(".result-card").text('Player 1 Turn');
				//console.log('reached');
			}
			else if(snapshot.val().turn == 2) {
				console.log('player2 - turn');
				turn = 2;

				$(".result-card").text('Player 2 Turn');
			}

		}

	}
});

// function to show player info on cards
function addPlayerInfoToDOM(id, player) {

	var myClass = '.player' + id.toString();

	// Show player name on card
	$(myClass).text(player.name);

	// Clear the stats view
	$(myClass + "-stats").empty();

	// Add stats info to view
	var statsList = $("<ul><li id='wins' >Wins: 0</li> <li id='losses'>Losses: 0</li> <li id='streak'>Best Streak: </li></ul>");
	$(myClass + "-stats").append(statsList);
}

// function to add a new player to firebase
function addNewPlayerToDB(id, name) {

	var referencePath = '/players/' + id.toString();
	db.ref(referencePath).set({
		name: name,
		wins: 0,
		losses: 0,
		option: "",
		state: "ready",
		streak: 0
	});
}

function checkResult() {
	if (player1.option == 'rock') {
		if (player2.option == 'rock') {
			console.log('tie - rock = rock');

			$(".result-card").text('Tie!');
		}
		else if(player2.option == 'paper') {
			console.log('player 2 wins - rock < paper');

			$(".result-card").text("Player 2 Wins!");

			db.ref(player1RefPath+'/losses').set(player1.losses+1);
			db.ref(player2RefPath+'/wins').set(player2.wins+1);
		}	
		else if(player2.option == 'scissors') {
			console.log('player 1 wins - rock > scissors');

			$(".result-card").text("Player 1 Wins!");

			db.ref(player1RefPath+'/wins').set(player1.wins+1);
			db.ref(player2RefPath+'/losses').set(player2.losses+1);
		}
	}
	else if (player1.option == 'paper') {
		if(player2.option == 'rock') {
			console.log('player 1 wins - paper > rock');

			$(".result-card").text('Player 1 Wins!');

			db.ref(player1RefPath+'/wins').set(player1.wins+1);
			db.ref(player2RefPath+'/losses').set(player2.losses+1);
		}
		else if(player2.option == 'paper') {
			console.log('tie - paper = paper');

			$(".result-card").text('Tie!');
		}
		else if(player2.option == 'scissors') {
			console.log('player 2 wins - paper < scissors');

			$(".result-card").text('Player 2 Wins!');

			db.ref(player1RefPath+'/losses').set(player1.losses+1);
			db.ref(player2RefPath+'/wins').set(player2.wins+1);
		}
	}
	else if (player1.option == 'scissors') {
		if(player2.option == 'rock') {
			console.log('player 2 wins - scissors < rock');

			db.ref(player1RefPath+'/losses').set(player1.losses+1);
			db.ref(player2RefPath+'/wins').set(player2.wins+1);
		}
		else if(player2.option == 'paper') {
			console.log('player 1 wins - scissors > paper');

			db.ref(player1RefPath+'/wins').set(player1.wins+1);
			db.ref(player2RefPath+'/losses').set(player2.losses+1);
		}
		else if(player2.option == 'scissors') {
			console.log('tie - scissors = scissors');

			$(".result-card").text('Tie!');
		}
	}
}

// Add Player Name Button Clicked
$("#add-player-name").on("click", function(event) {

	event.preventDefault();

	// Get Player Name
	var playerName = $("#playername").val().trim();

	myPlayerName = playerName;

	if (playerName == "") {
		alert("Please enter a name!");
		$("#playername").addClass('is-invalid');
		return;
	}
	else {
		// Check number of players in game and add players to db
		if (!player1 && !player2) {
			addNewPlayerToDB(1, playerName);
			$("#add-player-view").slideUp(1000);
			player1Name = playerName;
			player2Name = "";

			turn = 1;

			db.ref(gameRefPath).set({
				player1: player1Name,
				player2: player2Name,
				state: gameStates[0],
				turn: turn
			});

			db.ref('/players/1').onDisconnect().remove();
		}
		else if (!player1) {
			addNewPlayerToDB(1, playerName);
			$("#add-player-view").slideUp(1000);
			player1Name = playerName;

			turn = 1;

			db.ref(gameRefPath).set({
				player1: player1Name,
				player2: player2Name,
				state: gameStates[0],
				turn: turn
			});

			db.ref('/players/1').onDisconnect().remove();
		}
		else if (!player2Exists) {
			addNewPlayerToDB(2, playerName);
			$("#add-player-view").slideUp(1000);
			player2Name = playerName;

			turn = 1;

			db.ref(gameRefPath).set({
				player1: player1Name,
				player2: player2Name,
				state: gameStates[0],
				turn: turn
			});

			db.ref('/players/2').onDisconnect().remove();
		}
		else {
			alert('Game is Full! Please wait!');
		}
	}

});

$("#btn-rock").on("click", function(e) {
	
	e.preventDefault();

	if ((player1 && player2) && (myPlayerName == player1.name) && (turn == 1)) {
		var player1Choice = $(this).attr('data-value');
		console.log('player1 chose: ' + $(this).attr('data-value'));

		db.ref().child('/players/1/option').set(player1Choice);

		turn = 2;
		db.ref().child('/game/turn').set(turn);
	}
	if ((player1 && player2) && (myPlayerName == player2.name) && (turn == 2)) {
		var player2Choice = $(this).attr('data-value');
		console.log('player2 chose: ' + $(this).attr('data-value'));

		db.ref().child('/players/2/option').set(player2Choice);

		checkResult();
		//set the turn back to 1
		turn = 1;
		db.ref(gameRefPath+'/turn').set(turn);

	}

});

$("#btn-paper").on("click", function(e) {
	
	e.preventDefault();

	if ((player1 && player2) && (myPlayerName == player1.name) && (turn == 1)) {
		var player1Choice = $(this).attr('data-value');
		console.log('player1 chose: ' + $(this).attr('data-value'));

		db.ref().child('/players/1/option').set(player1Choice);

		turn = 2;
		db.ref().child('/game/turn').set(turn);
	}

	if ((player1 && player2) && (myPlayerName == player2.name) && (turn == 2)) {
		var player2Choice = $(this).attr('data-value');
		console.log('player2 chose: ' + $(this).attr('data-value'));

		db.ref().child('/players/2/option').set(player2Choice);

		checkResult();
		//set the turn back to 1
		turn = 1;
		db.ref(gameRefPath+'/turn').set(turn);

	}
});

$("#btn-scissors").on("click", function(e) {
	
	e.preventDefault();

	if ((player1 && player2) && (myPlayerName == player1.name) && (turn == 1)) {
		var player1Choice = $(this).attr('data-value');
		console.log('player1 chose: ' + $(this).attr('data-value'));

		db.ref().child('/players/1/option').set(player1Choice);

		turn = 2;
		db.ref().child('/game/turn').set(turn);
	}
	
	if ((player1 && player2) && (myPlayerName == player2.name) && (turn ==2 )) {
		var player2Choice = $(this).attr('data-value');
		console.log('player2 chose: ' + $(this).attr('data-value'));

		db.ref().child('/players/2/option').set(player2Choice);

		checkResult();

		//set the turn back to 1
		turn = 1;
		db.ref(gameRefPath+'/turn').set(turn);
	}
});



console.log('reached end');




