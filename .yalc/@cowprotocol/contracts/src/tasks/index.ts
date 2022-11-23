import { setupCopyArtifactsTask } from "./artifacts";
import { setupDecodeTask } from "./decode";
import { setupDumpTask } from "./dump";
import { setupPlaceOrderTask } from "./placeOrder";
import { setupSolversTask } from "./solvers";
import { setupTenderlyTask } from "./tenderly";
import { setupTransferOwnershipTask } from "./transferOwnership";
import { setupWithdrawTask } from "./withdraw";
import { setupWithdrawServiceTask } from "./withdrawService";

export function setupTasks(): void {
  setupCopyArtifactsTask();
  setupDecodeTask();
  setupDumpTask();
  setupPlaceOrderTask();
  setupSolversTask();
  setupTenderlyTask();
  setupTransferOwnershipTask();
  setupWithdrawTask();
  setupWithdrawServiceTask();
}
