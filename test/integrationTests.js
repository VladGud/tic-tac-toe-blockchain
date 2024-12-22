const ZeroKnowledgeRockPaperScissors = artifacts.require("ZeroKnowledgeRockPaperScissors");
const ProxyCaller = artifacts.require("ProxyCaller");

contract("ProxyCaller", (accounts) => {
    const [player1, player2] = accounts;

    it("should call joinGame via proxy", async () => {
        const zkRPS = await ZeroKnowledgeRockPaperScissors.new();
        const proxyCaller = await ProxyCaller.new(zkRPS.address);

        await proxyCaller.proxyJoinGame({ from: player1 });
        await proxyCaller.proxyJoinGame({ from: player2 });

        const gameState = await zkRPS.gameState();
        assert.equal(gameState.toNumber(), 1, "Game state should be Joined");

        const joinedPlayer1 = await zkRPS.player1();
        assert.equal(joinedPlayer1, player1, "Player 1 should be joined");
    });

    it("should call commitMove via proxy", async () => {
        const zkRPS = await ZeroKnowledgeRockPaperScissors.new();
        const proxyCaller = await ProxyCaller.new(zkRPS.address);

        await proxyCaller.proxyJoinGame({ from: player1 });
        await proxyCaller.proxyJoinGame({ from: player2 });

        const moveHash = web3.utils.keccak256(web3.eth.abi.encodeParameters(['uint256', 'uint256'], [1, 123]));
        await proxyCaller.proxyCommitMove(moveHash, { from: player1 });

        const player1MoveHash = await zkRPS.player1MoveHash();
        assert.equal(player1MoveHash, moveHash, "Player 1 move hash should be committed");
    });

    it("should call revealMove via proxy", async () => {
        const zkRPS = await ZeroKnowledgeRockPaperScissors.new();
        const proxyCaller = await ProxyCaller.new(zkRPS.address);

        await proxyCaller.proxyJoinGame({ from: player1 });
        await proxyCaller.proxyJoinGame({ from: player2 });

        const moveHash1 = web3.utils.keccak256(web3.eth.abi.encodeParameters(['uint256', 'uint256'], [1, 123]));
        const moveHash2 = web3.utils.keccak256(web3.eth.abi.encodeParameters(['uint256', 'uint256'], [2, 456]));

        await proxyCaller.proxyCommitMove(moveHash1, { from: player1 });
        await proxyCaller.proxyCommitMove(moveHash2, { from: player2 });

        await proxyCaller.proxyRevealMove(1, 123, { from: player1 });
        await proxyCaller.proxyRevealMove(2, 456, { from: player2 });

        const player1Move = await zkRPS.player1Move();
        const player2Move = await zkRPS.player2Move();

        assert.equal(player1Move.toNumber(), 1, "Player 1 move should be revealed");
        assert.equal(player2Move.toNumber(), 2, "Player 2 move should be revealed");

        const gameState = await zkRPS.gameState();
        assert.equal(gameState.toNumber(), 3, "Game state should be Finished");
    });
});
