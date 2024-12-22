// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./ZeroKnowledgeRockPaperScissors.sol";

contract ProxyCaller {
    address public target;

    event CallSuccess(bytes data);

    constructor(address _target) {
        target = _target;
    }

    function setTarget(address _target) external {
        target = _target;
    }

    function proxyJoinGame() external {
        (bool success, bytes memory data) = target.call(
            abi.encodeWithSignature("joinGame(address)", msg.sender)
        );
        require(success, "Call to joinGame failed");
        emit CallSuccess(data);
    }

    function proxyCommitMove(bytes32 moveHash) external {
        (bool success, bytes memory data) = target.call(
            abi.encodeWithSignature("commitMove(address,bytes32)", msg.sender, moveHash)
        );
        require(success, "Call to commitMove failed");
        emit CallSuccess(data);
    }

    function proxyRevealMove(uint move, uint nonce) external {
        (bool success, bytes memory data) = target.call(
            abi.encodeWithSignature("revealMove(address,uint256,uint256)", msg.sender, move, nonce)
        );
        require(success, "Call to revealMove failed");
        emit CallSuccess(data);
    }

    function getGameState() external view returns (ZeroKnowledgeRockPaperScissors.GameState) {
        (bool success, bytes memory data) = target.staticcall(
            abi.encodeWithSignature("getGameState()")
        );
        require(success, "Call to getGameState failed");
        return abi.decode(data, (ZeroKnowledgeRockPaperScissors.GameState));
    }

    function getPlayerMoves() external view returns (uint, uint) {
        (bool success, bytes memory data) = target.staticcall(
            abi.encodeWithSignature("getPlayerMoves()")
        );
        require(success, "Call to getPlayerMoves failed");
        return abi.decode(data, (uint, uint));
    }
}
