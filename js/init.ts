const assert = require("assert");
import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { DepositWithdraw } from '../target/types/deposit_withdraw';

import poolSecret from '../pool.json';

describe('deposit-withdraw', () => {

  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.Provider.env());

  const program = anchor.workspace.DepositWithdraw as Program<DepositWithdraw>;

  const provider = anchor.getProvider();

  const poolKeypair = anchor.web3.Keypair.fromSecretKey(new Uint8Array(poolSecret));
  
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
});
