const { assert, expect } = require("chai");
const { getNamedAccounts, deployments, ethers } = require("hardhat");
const { isCallTrace } = require("hardhat/internal/hardhat-network/stack-traces/message-trace");
const { INITIAL_SUPPLY } = require("../../helper-hardhat-config");

describe("FinArtToken Unit Test", function () {
    // Multiplier is used to make reading the math easier because of the 18 decimal points
    const multiplier = 10 ** 18;
    let FinArtToken, deployer, user1;
    beforeEach(async function () {
        const accounts = await getNamedAccounts();
        deployer = accounts.deployer;
        user1 = accounts.user1;

        await deployments.fixture("all");
        FinArtToken = await ethers.getContract("FinArtToken", deployer);
    });
    it("was deployed", async () => {
        assert(FinArtToken.address);
    });
    describe("constructor", () => {
        it("Should have correct INITIAL_SUPPLY of token", async () => {
            const totalSupply = await FinArtToken.totalSupply();
            assert.equal(totalSupply.toString(), INITIAL_SUPPLY);
        });
        it("initialises the token with the correct name and symbol ", async () => {
            const name = (await FinArtToken.name()).toString();
            assert.equal(name, "FinArtToken");

            const symbol = (await FinArtToken.symbol()).toString();
            assert.equal(symbol, "OT");
        });
    });
    describe("minting", () => {
        it("user can not mint", async () => {
            try {
                await FinArtToken._mint(deployer, 100);
                assert(false);
            } catch (e) {
                assert(e);
            }
        });
    });
    describe("transfers", () => {
        it("Should be able to transfer tokens successfully to an address", async () => {
            const tokensToSend = ethers.utils.parseEther("10");
            await FinArtToken.transfer(user1, tokensToSend);
            expect(await FinArtToken.balanceOf(user1)).to.equal(tokensToSend);
        });
        it("emits an transfer event, when a transfer occurs", async () => {
            await expect(
                FinArtToken.transfer(user1, (10 * multiplier).toString())
            ).to.emit(FinArtToken, "Transfer");
        });
        describe("allowances", () => {
            const amount = (20 * multiplier).toString();
            beforeEach(async () => {
                playerToken = await ethers.getContract("FinArtToken", user1);
            });
            it("Should approve other address to spend token", async () => {
                const tokensToSpend = ethers.utils.parseEther("5");
                await FinArtToken.approve(user1, tokensToSpend);
                const FinArtToken1 = await ethers.getContract("FinArtToken", user1);
                await FinArtToken1.transferFrom(deployer, user1, tokensToSpend);
                expect(await FinArtToken1.balanceOf(user1)).to.equal(
                    tokensToSpend
                );
            });
            it("doesn't allow an unnapproved member to do transfers", async () => {
                // Deployer is approving that user1 can spend 20 of their precious OT's

                await expect(
                    playerToken.transferFrom(deployer, user1, amount)
                ).to.be.revertedWith("ERC20: insufficient allowance");
            });
            it("emits an approval event, when an approval occurs", async () => {
                await expect(FinArtToken.approve(user1, amount)).to.emit(
                    FinArtToken,
                    "Approval"
                );
            });
            it("the allowance being set is accurate", async () => {
                await FinArtToken.approve(user1, amount);
                const allowance = await FinArtToken.allowance(deployer, user1);
                assert.equal(allowance.toString(), amount);
            });
            it("won't allow a user to go over the allowance", async () => {
                await FinArtToken.approve(user1, amount);
                await expect(
                    playerToken.transferFrom(
                        deployer,
                        user1,
                        (40 * multiplier).toString()
                    )
                ).to.be.revertedWith("ERC20: insufficient allowance");
            });
        });
    });

});