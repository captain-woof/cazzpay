import { ethers, run } from "hardhat";

// CONTRACT ADDRESSES
const UNISWAP_V2_FACTORY = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
const UNISWAP_V2_ROUTER = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
const WETH = "0xc778417E063141139Fce010982780140Aa0cD5Ab";
const REDSTONE_SIGNER = "0x0C39486f770B26F5527BBBf942726537986Cd7eb";

///////////////////////////
// HELPER FUNCS
///////////////////////////
const sleep = (sleepDurationInSecs: number) => (new Promise((resolve) => {
    setTimeout(resolve, sleepDurationInSecs * 1000);
}));

///////////////////////////
// MAIN FUNCTION
///////////////////////////
(async () => {

    console.log("\n\n[+] Deploying contracts...");

    /*// Deploy CZP
    const czpTokenContract = await (await (await ethers.getContractFactory("CazzPayToken")).deploy(ethers.utils.parseEther("10000000"))).deployed();
    console.log("\t [>] $CZP contract deployed!");

    // Deploy TestCoin
    const testCoinContract = await (await (await ethers.getContractFactory("TestCoin")).deploy(ethers.utils.parseEther("10000000"))).deployed();
    console.log("\t [>] $TST contract deployed!");*/

    // Deploy CazzPay
    const cazzPayContract = await (await (await ethers.getContractFactory("CazzPay")).deploy(
        UNISWAP_V2_FACTORY,
        UNISWAP_V2_ROUTER,
        "0x8d7b5E919620D2C9742389bc1CeC671eaB0E3150",
        WETH,
        100, // Payment processing fees = 1%
        REDSTONE_SIGNER))

        .deployed();
    console.log("\t [>] CazzPay contract deployed!");

    // Print contract addresses
    console.table([
        /*{
            Name: "CazzPayToken",
            Address: czpTokenContract.address
        },
        {
            Name: "TestCoin",
            Address: testCoinContract.address
        },*/
        {
            Name: "CazzPay",
            Address: cazzPayContract.address
        },
    ]);

    // Verify contracts
    console.log("\n[...] Waiting a few mins before starting verification...")
    await sleep(120);
    await Promise.all([
        /*run("verify:verify", {
            address: czpTokenContract.address,
            constructorArguments: [ethers.utils.parseEther("10000000")],
        }),
        run("verify:verify", {
            address: testCoinContract.address,
            constructorArguments: [ethers.utils.parseEther("10000000")],
        }),*/
        run("verify:verify", {
            address: cazzPayContract.address,
            constructorArguments: [
                UNISWAP_V2_FACTORY,
                UNISWAP_V2_ROUTER,
                "0x8d7b5E919620D2C9742389bc1CeC671eaB0E3150",
                WETH,
                100, // Payment processing fees = 1%
                REDSTONE_SIGNER
            ],
        })
    ]);
    console.log("\n[+] Contracts verified!")
})()
    .then(() => { process.exit(0); })
    .catch((e) => { console.error(e); process.exit(1); })
