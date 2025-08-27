import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { TaskEscrow } from "../target/types/task_escrow";
import { expect } from "chai";

describe("task-escrow", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.TaskEscrow as Program<TaskEscrow>;
  
  // Test accounts
  const poster = anchor.web3.Keypair.generate();
  const worker = anchor.web3.Keypair.generate();
  const taskId = "test-task-123";

  let escrowPda: anchor.web3.PublicKey;
  let escrowBump: number;

  before(async () => {
    // Airdrop SOL to test accounts
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(poster.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL)
    );
    
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(worker.publicKey, 1 * anchor.web3.LAMPORTS_PER_SOL)
    );

    // Derive escrow PDA
    [escrowPda, escrowBump] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("task_escrow"), Buffer.from(taskId)],
      program.programId
    );
  });

  it("Creates a task escrow", async () => {
    const amount = new anchor.BN(0.1 * anchor.web3.LAMPORTS_PER_SOL); // 0.1 SOL

    await program.methods
      .createTaskEscrow(taskId, amount, worker.publicKey)
      .accounts({
        escrow: escrowPda,
        poster: poster.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([poster])
      .rpc();

    // Verify escrow account
    const escrowAccount = await program.account.taskEscrow.fetch(escrowPda);
    expect(escrowAccount.poster.toString()).to.equal(poster.publicKey.toString());
    expect(escrowAccount.worker.toString()).to.equal(worker.publicKey.toString());
    expect(escrowAccount.taskId).to.equal(taskId);
    expect(escrowAccount.amount.toString()).to.equal(amount.toString());
    expect(escrowAccount.status).to.deep.equal({ created: {} });
  });

  it("Funds the escrow", async () => {
    const posterBalanceBefore = await provider.connection.getBalance(poster.publicKey);

    await program.methods
      .fundEscrow()
      .accounts({
        escrow: escrowPda,
        poster: poster.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([poster])
      .rpc();

    // Verify escrow status and balance
    const escrowAccount = await program.account.taskEscrow.fetch(escrowPda);
    expect(escrowAccount.status).to.deep.equal({ funded: {} });
    expect(escrowAccount.fundedAt).to.not.be.null;

    // Check poster balance decreased
    const posterBalanceAfter = await provider.connection.getBalance(poster.publicKey);
    expect(posterBalanceBefore).to.be.greaterThan(posterBalanceAfter);

    // Check escrow account has the funds
    const escrowBalance = await provider.connection.getBalance(escrowPda);
    expect(escrowBalance).to.be.greaterThan(0);
  });

  it("Releases funds to worker", async () => {
    const workerBalanceBefore = await provider.connection.getBalance(worker.publicKey);

    await program.methods
      .releaseFunds()
      .accounts({
        escrow: escrowPda,
        poster: poster.publicKey,
        worker: worker.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([poster])
      .rpc();

    // Verify escrow status
    const escrowAccount = await program.account.taskEscrow.fetch(escrowPda);
    expect(escrowAccount.status).to.deep.equal({ released: {} });
    expect(escrowAccount.releasedAt).to.not.be.null;

    // Check worker received funds
    const workerBalanceAfter = await provider.connection.getBalance(worker.publicKey);
    expect(workerBalanceAfter).to.be.greaterThan(workerBalanceBefore);
  });

  it("Fails to fund escrow twice", async () => {
    const newTaskId = "test-task-456";
    const amount = new anchor.BN(0.1 * anchor.web3.LAMPORTS_PER_SOL);

    const [newEscrowPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("task_escrow"), Buffer.from(newTaskId)],
      program.programId
    );

    // Create new escrow
    await program.methods
      .createTaskEscrow(newTaskId, amount, worker.publicKey)
      .accounts({
        escrow: newEscrowPda,
        poster: poster.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([poster])
      .rpc();

    // Fund escrow
    await program.methods
      .fundEscrow()
      .accounts({
        escrow: newEscrowPda,
        poster: poster.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([poster])
      .rpc();

    // Try to fund again - should fail
    try {
      await program.methods
        .fundEscrow()
        .accounts({
          escrow: newEscrowPda,
          poster: poster.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([poster])
        .rpc();
      
      expect.fail("Should have thrown an error");
    } catch (error) {
      expect(error.toString()).to.include("InvalidEscrowStatus");
    }
  });

  it("Allows poster to cancel unfunded escrow", async () => {
    const cancelTaskId = "cancel-task-789";
    const amount = new anchor.BN(0.1 * anchor.web3.LAMPORTS_PER_SOL);

    const [cancelEscrowPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("task_escrow"), Buffer.from(cancelTaskId)],
      program.programId
    );

    // Create and fund escrow
    await program.methods
      .createTaskEscrow(cancelTaskId, amount, worker.publicKey)
      .accounts({
        escrow: cancelEscrowPda,
        poster: poster.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([poster])
      .rpc();

    await program.methods
      .fundEscrow()
      .accounts({
        escrow: cancelEscrowPda,
        poster: poster.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([poster])
      .rpc();

    const posterBalanceBefore = await provider.connection.getBalance(poster.publicKey);

    // Cancel escrow
    await program.methods
      .cancelEscrow()
      .accounts({
        escrow: cancelEscrowPda,
        poster: poster.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([poster])
      .rpc();

    // Verify escrow status
    const escrowAccount = await program.account.taskEscrow.fetch(cancelEscrowPda);
    expect(escrowAccount.status).to.deep.equal({ cancelled: {} });

    // Check poster got funds back
    const posterBalanceAfter = await provider.connection.getBalance(poster.publicKey);
    expect(posterBalanceAfter).to.be.greaterThan(posterBalanceBefore);
  });

  it("Prevents unauthorized release", async () => {
    const unauthorizedTaskId = "unauthorized-task-999";
    const amount = new anchor.BN(0.1 * anchor.web3.LAMPORTS_PER_SOL);
    const unauthorizedUser = anchor.web3.Keypair.generate();

    // Airdrop to unauthorized user
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(unauthorizedUser.publicKey, 1 * anchor.web3.LAMPORTS_PER_SOL)
    );

    const [unauthorizedEscrowPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("task_escrow"), Buffer.from(unauthorizedTaskId)],
      program.programId
    );

    // Create and fund escrow
    await program.methods
      .createTaskEscrow(unauthorizedTaskId, amount, worker.publicKey)
      .accounts({
        escrow: unauthorizedEscrowPda,
        poster: poster.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([poster])
      .rpc();

    await program.methods
      .fundEscrow()
      .accounts({
        escrow: unauthorizedEscrowPda,
        poster: poster.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([poster])
      .rpc();

    // Try to release with unauthorized user - should fail
    try {
      await program.methods
        .releaseFunds()
        .accounts({
          escrow: unauthorizedEscrowPda,
          poster: unauthorizedUser.publicKey,
          worker: worker.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([unauthorizedUser])
        .rpc();
      
      expect.fail("Should have thrown an error");
    } catch (error) {
      expect(error.toString()).to.include("UnauthorizedPoster");
    }
  });
});