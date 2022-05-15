import { ethers, run } from "hardhat";

async function main() {

  // Deploy contract
  console.log("Deploying CazzPayOracle...")
  const cazzPayOracleContractFactory = await ethers.getContractFactory("CazzPayOracle");
  const cazzPayOracleContract = await cazzPayOracleContractFactory.deploy();
  await cazzPayOracleContract.deployed();
  console.log("[+] CazzPayOracle: ", cazzPayOracleContract.address);

  // Verify contract
  console.log("\n[...] Waiting for some time before verifying contract...");
  await executeAsyncCallbackAfterSomeTime(120, async () => {
    await run("verify:verify", {
      address: cazzPayOracleContract.address,
      constructorArguments: [],
    });
  });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

////////////////////////
// HELPER FUNCS
////////////////////////

const executeAsyncCallbackAfterSomeTime = (timeToWaitInSecs: number, callbackToExecute: () => Promise<any>) => (
  new Promise((resolve) => {
    setTimeout(() => {
      callbackToExecute()
        .then(resolve);
    }, timeToWaitInSecs * 1000);
  }));