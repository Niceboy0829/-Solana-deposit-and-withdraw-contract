const assert = require("assert");
import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { DepositWithdraw } from '../target/types/deposit_withdraw';

describe('deposit-withdraw', () => {

  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.Provider.env());
  const provider = anchor.getProvider();

  const program = anchor.workspace.DepositWithdraw as Program<DepositWithdraw>;

  let poolKeypair = anchor.web3.Keypair.generate();

  it('Is initialized!', async () => {
    const [
        poolSigner,
        nonce,
    ] = await anchor.web3.PublicKey.findProgramAddress(
        [
          poolKeypair.publicKey.toBuffer(),
        ],
        program.programId
    );

    const tx = await program.rpc.initialize(nonce, {
      accounts: {
        authority: provider.wallet.publicKey,
        pool: poolKeypair.publicKey,
        poolSigner: poolSigner,
        owner: provider.wallet.publicKey,
        vault: poolSigner,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
      signers: [poolKeypair, ],
      instructions: [
          await program.account.pool.createInstruction(poolKeypair, ),
      ],
    });
    console.log("Your transaction signature", tx);
  });

  it('Deposit', async () => {
    const [
        poolSigner,
        nonce,
    ] = await anchor.web3.PublicKey.findProgramAddress(
        [
          poolKeypair.publicKey.toBuffer(),
        ],
        program.programId
    );

    const amount = anchor.web3.LAMPORTS_PER_SOL / 10;
    const tx = await program.rpc.deposit(new anchor.BN(amount), {
      accounts: {
        pool: poolKeypair.publicKey,
        authority: provider.wallet.publicKey,
        vault: poolSigner,
        depositor: provider.wallet.publicKey,
        poolSigner: poolSigner,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
    });

    let contractLamports = (await provider.connection.getBalance(poolSigner));
    assert.equal(contractLamports, amount);
  })

  it('Withdraw', async () => {
    const [
        poolSigner,
        nonce,
    ] = await anchor.web3.PublicKey.findProgramAddress(
        [
          poolKeypair.publicKey.toBuffer(),
        ],
        program.programId
    );

    const amount = anchor.web3.LAMPORTS_PER_SOL / 10;
    const tx = await program.rpc.withdraw(new anchor.BN(amount), {
      accounts: {
        pool: poolKeypair.publicKey,
        authority: provider.wallet.publicKey,
        vault: poolSigner,
        receiver: provider.wallet.publicKey,
        poolSigner: poolSigner,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
    });

    let contractLamports = (await provider.connection.getBalance(poolSigner));
    assert.equal(contractLamports, 0);
  })
});
