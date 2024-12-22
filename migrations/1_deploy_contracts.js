const ZeroKnowledgeRockPaperScissors = artifacts.require("ZeroKnowledgeRockPaperScissors");
const ProxyCaller = artifacts.require("ProxyCaller");

module.exports = async function (deployer) {
  await deployer.deploy(ZeroKnowledgeRockPaperScissors);
  const zkRPSInstance = await ZeroKnowledgeRockPaperScissors.deployed();
  await deployer.deploy(ProxyCaller, zkRPSInstance.address);
};
