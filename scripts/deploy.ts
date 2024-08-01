
// Importing necessary functionalities from the Hardhat package.
import { ethers } from 'hardhat'

async function main() {
    // Retrieve the first signer, typically the default account in Hardhat, to use as the deployer.
    const [deployer] = await ethers.getSigners()
    
    // This is sepolia test token

    const instanceHenloToken = await ethers.deployContract('henlo');
    await instanceHenloToken.waitForDeployment()
    console.log(`HenloPresale contract is deployed. Token address: ${instanceHenloToken.target}`)




    // const tokenAddress = "0xe90f70F461C561D9281D2Af6b6c98ECAec9fD850"; // mainnet $henlo address
    const tokenAddress = instanceHenloToken.target; // It's for sepolia test token
    const presaleRate = 100; // It depends on your choice
    const minContribution = ethers.parseEther("10"); // It depends on your choice
    const maxContribution = ethers.parseEther("1000000"); // It depends on your choice
    const presaleDuration = 3600 * 24 * 10; // It depends on your choice

    console.log('Contract is deploying...')
    const instanceHenloPresale = await ethers.deployContract('HENLOPresale', [tokenAddress, presaleRate, minContribution, maxContribution, presaleDuration]);

    // Waiting for the contract deployment to be confirmed on the blockchain.
    await instanceHenloPresale.waitForDeployment()

    // Logging the address of the deployed My404 contract.
    console.log(`HenloPresale contract is deployed. Token address: ${instanceHenloPresale.target}`)

    
}

// This pattern allows the use of async/await throughout and ensures that errors are caught and handled properly.
main().catch(error => {
    console.error(error)
    process.exitCode = 1
})