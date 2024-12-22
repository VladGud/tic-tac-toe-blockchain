const { Web3 } = require('web3');
const { abi } = require('./build/contracts/ZeroKnowledgeRockPaperScissors.json');

const contractAddress = '0x272090C3643E922A06724befFfA82e7234EbA41D'
const privateKey = '0xaae03d075638d3e510e7f33d499e6c9a624790e809123b9fba4f4ee8e710ce8d'; // Укажите свой приватный ключ
const web3 = new Web3('http://127.0.0.1:8545'); // Подключение к локальному Ganache
let myContract;
let account;

const connectToContract = async () => {
  account = web3.eth.accounts.privateKeyToAccount(privateKey);
  web3.eth.accounts.wallet.add(account);
  web3.eth.defaultAccount = account.address;

  // Взаимодействие с контрактом
  myContract = new web3.eth.Contract(abi, contractAddress);
  const gameState = await myContract.methods.getGameState().call();
  console.log("Game State: ", gameState);

  //  Подписка на события 
};

async function subscribe() {
  // subscribe to the smart contract event
  const subscription = myContract.events.MoveCommitted({
    fromBlock: 'latest',
  }, (error, event) => {});

  subscription.on('data', console.log);
  myContract.methods.commitMove("0x6BE6E6D94c6E145D3e9F11Fe317EF82d0c38F032", "0x4535a04e923af75e64a9f6cdfb922004b40beec0649d36cf6ea095b7c4975cae").send({"from": "0x6BE6E6D94c6E145D3e9F11Fe317EF82d0c38F032"});
  await subscription.unsubscribe();
}


const startApp = async () => {
  await connectToContract();
  await subscribe();
};

startApp();
