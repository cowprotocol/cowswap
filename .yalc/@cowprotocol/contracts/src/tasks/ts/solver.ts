import { Contract } from "ethers";

export async function getSolvers(authenticator: Contract): Promise<string[]> {
  const addedSolvers: string[] = (
    await authenticator.queryFilter(authenticator.filters.SolverAdded())
  ).map((log) => {
    // "SolverAdded" always has the argument "solver"
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return log.args!.solver;
  });
  const isSolver = await Promise.all(
    addedSolvers.map((solver) => authenticator.isSolver(solver)),
  );
  return addedSolvers.filter((_, i) => isSolver[i]);
}
