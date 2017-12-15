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


// Global variables
var player 1 = null;
var player 2 = null;

var player1Exists = false;
var player2Exists = false;

var player1Name = "";
var player2Name = "";

// name of player in the user's browser
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


// changes in '/players' reference path
db.ref(playersRefPath).on("value", function(snapshot) {

	// if '/players' exists
	if (snapshot.exists()){

		//check if player1 exists
		if (snapshot.child('1').exists()) {
			console.log("player1 exists");
			player1Exists = true;

			// store player1 object
			player1 = snapshot.child('1').val();
			player1Name = player1.name;

			//update player1 card
			$(".player1").text(player1Name);
			var statsList = $("<ul><li id='wins' >Wins: " + player1.wins + 
				"</li> <li id='losses'>Losses: " + player1.losses + 
				"</li> <li id='streak'>Best Streak: " + player1.streak + "</li></ul>");
			$(".player1-stats").append(statsList);

			db.ref(gameRefPath).set({
				state: gameStates[0],
				player1: player1Name,
				player2: player2Name,
				turn: turn
			});
			console.log('game: ' + snapshot.parent('/game').val());
		}
		else {
			console.log('player1 does not exist');
			player1Exists = false;

			player1 = null;
			player1Name = "";

			//update player1 card
			$(".player1").text("Waiting for Player 1...");
			var statsList = $("<ul><li id='wins' >Wins: 0" + 
				"</li> <li id='losses'>Losses: 0"  +
				"</li> <li id='streak'>Best Streak: 0</li></ul>");
			$(".player1-stats").append(statsList);

		}

		//check if player2 exists
		if (snapshot.child('2').exists()) {
			console.log("player2 exists");
			player2Exists = true;

			//store player2 object
			player2 = snapshot.child('2').val();
			player2Name = player2.name;

			//update player2 card
			$(".player2").text(player2Name);
			var statsList = $("<ul><li id='wins' >Wins: " + player2.wins + 
				"</li> <li id='losses'>Losses: " + player2.losses + 
				"</li> <li id='streak'>Best Streak: " + player2.streak + "</li></ul>");
			$(".player2-stats").append(statsList);

			db.ref(gameRefPath).set({
				state: gameStates[0],
				player1: player1Name,
				player2: player2Name,
				turn: turn
			});
			console.log('game: ' + snapshot.parent('/game').val());
		}
		else {
			console.log('player2 does not exist');
			player2Exists = false;

			player2 = null;
			player2Name = "";

			//update player2 card
			$(".player2").text("Waiting for Player 2...");
			var statsList = $("<ul><li id='wins' >Wins: 0" + 
				"</li> <li id='losses'>Losses: 0"  +
				"</li> <li id='streak'>Best Streak: 0</li></ul>");
			$(".player2-stats").append(statsList);
		}

		if(player1 && player2) {
			console.log('player1 and player2 exist');

			player1 = snapshot.child('1').val();
			player1Name = player1.name;

			player2 = snapshot.child('2').val();
			player2Name = player2.name;

			db.ref(gameRefPath).set({
				state: gameStates[1],
				player1: player1Name,
				player2: player2Name,
				turn: turn
			});

			//READY TO START GAME 
			//ALLOW PLAYER 1 TO CHOOSE AN OPTION!

			$(".result-card").text('Game is ready to start');

		}

		if (!player1 && !player2) {
			//no players in the game
			console.log('no players exists');
			db.ref(gameRefPath).set({
				state: gameStates[0],
				player1: "",
				player2: "",
				turn: turn
			});

			$(".result-card").text('Waiting for players');
		}
	}
});


// check to detect if player disconnected
db.ref(playersRefPath).on("child_removed", function(snapshot) {
	console.log(snapshot.val());
	var msg = snapshot.val().name + "has disconnected";

	//get a key for the disconnection chat entry
	var chatKey = db.ref().child("/chat/").push().key;

	// save the disconnection chat entry
	db.ref("/chat/" + chatKey).set(msg);
});


// check who's turn it is
db.ref(gameRefPath).on("value", function(snapshot) {
	if ((snapshot.val().turn == 1) && (snapshot.val().state == "ready")) {
		console.log('ready to start - player1 turn');
		turn = 1;

		$(".result-card").text('Player 1 Turn');
	}
	else if ((snapshot.val().turn == 2) && (snapshot.val().state == "ready")) {
		console.log('player 1 has chosen - player2 turn');
		turn = 2;

		$(".result-card").text('Player 2 Turn');
	}
});








