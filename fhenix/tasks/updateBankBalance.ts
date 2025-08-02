import { Midas } from "../typechain-types";
import { task, types } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

task("task:updateBankBalance")
  .addPositionalParam("amount", "Bank balance amount to update", 0, types.int)
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { fhenixjs, ethers, deployments } = hre;
    const [signer] = await ethers.getSigners();

    if ((await ethers.provider.getBalance(signer.address)).toString() === "0") {
      await fhenixjs.getFunds(signer.address);
    }

    const balanceAmount = Number(taskArguments.amount);
    const MidasDeployment = await deployments.get("Midas");

    console.log(
              `Running updateBankBalance(${balanceAmount}), targeting contract at: ${MidasDeployment.address}`,
    );

    const contract = await ethers.getContractAt("Midas", MidasDeployment.address);

    const encryptedAmount = await fhenixjs.encrypt_uint32(balanceAmount);

    let contractWithSigner = contract.connect(signer) as unknown as Midas;

    try {
      await contractWithSigner.updateBankBalance(encryptedAmount);
      console.log("Bank balance updated successfully");
    } catch (e) {
      console.log(`Failed to update bank balance: ${e}`);
    }
  });
