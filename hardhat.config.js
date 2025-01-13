require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    sepolia: {
      url: 'https://sepolia.infura.io/v3/d7f7ae19f7c24fd1acff6dd5d394ca4d',
      accounts: ['0x9a2f5ea77fa47d725bc0646dc02c673f7506aac610d0d62ec0dff8cb3980429a'],
    },
  },
};
