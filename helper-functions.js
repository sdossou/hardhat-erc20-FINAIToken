// we can't have these functions in our 'helper-hardhat-config'
// since these use the hardhat library and it would be a circular dependency
const { getContractAddress } = require("ethers/lib/utils")
const { run, network } = require("hardhat")
const { networkConfig } = require("./helper-hardhat-config")

const verify = async (getContractAddress, args) => {
    console.log("Verifying contract...")
    try {
        await run("verify:verify", {
            address: getContractAddress,
            constructorArguments: args,
        })
    } catch (e) {
        if (e.message.toLowerCase().includes("already verified!")) {
            console.log("Already verified!")
        } else {
            console.log(e)
        }
    }
}

module.exports = {
    verify,
}