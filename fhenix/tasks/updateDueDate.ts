import { Midas } from "../typechain-types";
import { task, types } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

task("task:updateDueDate")
  .addPositionalParam("date", "Due date in YYYY-MM-DD format", undefined, types.string)
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { fhenixjs, ethers, deployments } = hre;
    const [signer] = await ethers.getSigners();

    // Parse the input date string to a Date object
    const inputDate = new Date(taskArguments.date);
    if (isNaN(inputDate.getTime())) {
      console.log("Invalid date format. Please use YYYY-MM-DD.");
      return;
    }

    // Convert the date to a Unix timestamp (seconds since epoch)
    const dueDate = Math.floor(inputDate.getTime() / 1000);

    const MidasDeployment = await deployments.get("Midas");

    console.log(
              `Running updateDueDate(${inputDate.toISOString()}), targeting contract at: ${MidasDeployment.address}`,
    );

    const contract = await ethers.getContractAt("Midas", MidasDeployment.address);

    const encryptedDueDate = await fhenixjs.encrypt_uint32(dueDate);

    let contractWithSigner = contract.connect(signer) as unknown as Midas;

    try {
      await contractWithSigner.updateDueDate(encryptedDueDate);
      console.log("Due date updated successfully");
    } catch (e) {
      console.log(`Failed to update due date: ${e}`);
    }
  });
