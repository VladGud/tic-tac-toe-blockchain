// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ZeroKnowledgeRockPaperScissors {
    enum GameState { Created, Joined, Revealed, Finished }
    GameState public gameState;

    address public owner;
    address public player1;
    address public player2;

    bytes32 public player1MoveHash; // Hashed move of player 1
    bytes32 public player2MoveHash; // Hashed move of player 2

    uint public player1Move; // Revealed move of player 1
    uint public player2Move; // Revealed move of player 2

    event MoveHashLog(bytes32 moveHash);
    event GameCreated(address indexed player1);
    event PlayerJoined(address indexed player2);
    event MoveCommitted(address indexed player, bytes32 moveHash);
    event MoveRevealed(address indexed player, uint move);
    event GameFinished(address winner);

    modifier onlyPlayers(address sender) {
        require(sender == player1 || sender == player2, "Not a player");
        _;
    }

    modifier inState(GameState expectedState) {
        require(gameState == expectedState, "Invalid game state");
        _;
    }

    constructor() {
        owner = msg.sender;
        gameState = GameState.Created;
        emit GameCreated(owner);
    }

    function joinGame(address sender) external inState(GameState.Created) {
        require(player1 == address(0) || player2 == address(0), "All users have already joined");
        
        if (player1 == address(0)) {
            player1 = sender;
            emit PlayerJoined(player1);
        } else {
            player2 = sender;
            emit PlayerJoined(player2);
        }

        if (player1 != address(0) && player2 != address(0)) {
            gameState = GameState.Joined;
        }
    }

    function commitMove(address sender, bytes32 moveHash) external onlyPlayers(sender) inState(GameState.Joined) {
        if (sender == player1) {
            player1MoveHash = moveHash;
        } else if (sender == player2) {
            player2MoveHash = moveHash;
        }

        if (player1MoveHash != bytes32(0) && player2MoveHash != bytes32(0)) {
            gameState = GameState.Revealed;
        }

        emit MoveCommitted(sender, moveHash);
    }

    function revealMove(address sender, uint move, uint nonce) external onlyPlayers(sender) inState(GameState.Revealed) {
        bytes32 moveHash = keccak256(abi.encodePacked(move, nonce));
        
        if (sender == player1) {
            require(player1MoveHash == moveHash, "Invalid move or nonce for player 1");
            player1Move = move;
        } else if (sender == player2) {
            require(player2MoveHash == moveHash, "Invalid move or nonce for player 2");
            player2Move = move;
        }

        if (player1Move != 0 && player2Move != 0) {
            address winner = determineWinner();
            gameState = GameState.Finished;
            emit GameFinished(winner);
        }

        emit MoveRevealed(sender, move);
    }

    function determineWinner() internal view returns (address) {
        // Moves: 1 = Rock, 2 = Paper, 3 = Scissors
        if (player1Move == player2Move) {
            return address(0); // Draw
        }
        if ((player1Move == 1 && player2Move == 3) ||
            (player1Move == 2 && player2Move == 1) ||
            (player1Move == 3 && player2Move == 2)) {
            return player1;
        } else {
            return player2;
        }
    }

    function getGameState() external view returns (GameState) {
        return gameState;
    }

    function getPlayerMoves() external view inState(GameState.Finished) returns (uint, uint) {
        return (player1Move, player2Move);
    }
}
