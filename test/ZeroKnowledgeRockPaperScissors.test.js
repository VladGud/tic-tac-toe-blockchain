const ZeroKnowledgeRockPaperScissors = artifacts.require("ZeroKnowledgeRockPaperScissors");
const truffleAssert = require('truffle-assertions');

contract("ZeroKnowledgeRockPaperScissors", (accounts) => {
  let instance;
  const player1 = accounts[0];
  const player2 = accounts[1];
  const nonPlayer = accounts[2];
  const move1 = 1; // Rock
  const move2 = 2; // Paper
  const nonce1 = 123;
  const nonce2 = 456;
  const moveHash1 = web3.utils.soliditySha3({ type: 'uint', value: move1 }, { type: 'uint', value: nonce1 });
  const moveHash2 = web3.utils.soliditySha3({ type: 'uint', value: move2 }, { type: 'uint', value: nonce2 });

  beforeEach(async () => {
    instance = await ZeroKnowledgeRockPaperScissors.new({ from: player1 });
  });

  it("should create a game and emit GameCreated event", async () => {
    const gameState = await instance.getGameState();
    assert.equal(gameState.toString(), "0", "Game state should be Created");
  });

  it("should allow player2 to join the game and emit PlayerJoined event", async () => {
    await instance.joinGame(player1, { from: player1 });
    await instance.joinGame(player2, { from: player2 });
    const gameState = await instance.getGameState();
    assert.equal(gameState.toString(), "1", "Game state should be Joined");
  });

  it("should not allow a third player to join the game", async () => {
    await instance.joinGame(player1, { from: player1 });
    await instance.joinGame(player2, { from: player2 });
    try {
      await instance.joinGame(nonPlayer, { from: nonPlayer });
      assert.fail("Third player should not be able to join");
    } catch (error) {
      assert.include(error.message, "revert Invalid game state", "Expected error message");
    }
  });

  it("should allow players to commit their moves and emit MoveCommitted event", async () => {
    await instance.joinGame(player1, { from: player1 });
    await instance.joinGame(player2, { from: player2 });

    await instance.commitMove(player1, moveHash1, { from: player1 });
    await instance.commitMove(player2, moveHash2, { from: player2 });

    const gameState = await instance.getGameState();
    assert.equal(gameState.toString(), "2", "Game state should be Revealed");
  });

  it("should allow players to reveal their moves and emit MoveRevealed event", async () => {
    await instance.joinGame(player1, { from: player1 });
    await instance.joinGame(player2, { from: player2 });

    await instance.commitMove(player1, moveHash1, { from: player1 });
    await instance.commitMove(player2, moveHash2, { from: player2 });

    await instance.revealMove(player1, move1, nonce1, { from: player1 });
    await instance.revealMove(player2, move2, nonce2, { from: player2 });

    const gameState = await instance.getGameState();
    assert.equal(gameState.toString(), "3", "Game state should be Finished");
  });

  it("should revert with correct error message on invalid move reveal", async () => {
    await instance.joinGame(player1, { from: player1 });
    await instance.joinGame(player2, { from: player2 });

    await instance.commitMove(player1, moveHash1, { from: player1 });
    await instance.commitMove(player2, moveHash2, { from: player2 });

    try {
      await instance.revealMove(player1, move1, 999, { from: player1 }); // Incorrect nonce
      assert.fail("Expected revert not received");
    } catch (error) {
      assert.include(error.message, "Invalid move or nonce for player 1", "Expected revert error message");
    }
  });

  it("should correctly determine the winner and emit GameFinished event", async () => {
    await instance.joinGame(player1, { from: player1 });
    await instance.joinGame(player2, { from: player2 });

    await instance.commitMove(player1, moveHash1, { from: player1 });
    await instance.commitMove(player2, moveHash2, { from: player2 });

    await instance.revealMove(player1, move1, nonce1, { from: player1 });
    let reveal = await instance.revealMove(player2, move2, nonce2, { from: player2 });
    truffleAssert.eventEmitted(reveal, 'GameFinished', (ev) => {
      return ev.winner === player2;
    });
  });
});
