import { Midas } from "../typechain-types";
import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

task("task:getFinancialData").setAction(async function (
  _taskArguments: TaskArguments,
  hre
) {
  const { fhenixjs, ethers, deployments } = hre;
  const [signer] = await ethers.getSigners();

      const MidasDeployment = await deployments.get("Midas");

      console.log(`Running getFinancialData, targeting contract at: ${MidasDeployment.address}`);

      const contract = (await ethers.getContractAt(
        "Midas",
        MidasDeployment.address
    )) as unknown as Midas;

  let permit = await fhenixjs.generatePermit(
    MidasDeployment.address,
    undefined, // use the internal provider
    signer
  );

  try {
    const bankBalance = await contract.getBankBalance(permit);
    const creditCardBalance = await contract.getCreditCardBalance(permit);
    const dueDate = await contract.getDueDate(permit);

    console.log(`Bank Balance: ${bankBalance.toString()}`);
    console.log(`Credit Card Balance: ${creditCardBalance.toString()}`);
    console.log(`Due Date: ${new Date(Number(dueDate) * 1000).toISOString()}`);

    console.log("All data retrieved successfully.");
  } catch (e) {
    console.log(`Failed to get financial data: ${e}`);
  }
});
