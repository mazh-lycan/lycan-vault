async function main() {

    const [deployer] = await ethers.getSigners();

    console.log(
    "Deploying contracts with the account:",
    deployer.address
    );

    const AISavior = await ethers.getContractFactory("AISavior");
    const contract = await AISavior.deploy();

    console.log("Contract deployed at:", contract.address);

    //const getvalue = await contract.speak();
    
    const addressSBT = await contract.getAddress(); 
    //console.log("got the value:", getvalue);
    console.log("address is: ", addressSBT);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });