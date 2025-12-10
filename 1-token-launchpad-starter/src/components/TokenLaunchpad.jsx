import { createInitializeAccount2Instruction, getMinimumBalanceForRentExemptAccount, getMinimumBalanceForRentExemptMint, MINT_SIZE, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react/lib/types";
import { Keypair, SystemProgram, Transaction } from "@solana/web3.js";

export function TokenLaunchpad() {

    function createToken(){
        const name = document.getElementById('name').value;
        const symbol = document.getElementById('symbol').value ;
        const image = document.getElementById('image').value ;
        const initialSupply = document.getElementById('initalSupply').value;

        const {connection } = useConnection();
        const wallet = useWallet();

        async function createToken() {
            const mintKeypair = Keypair.generate();
            const lamports = await getMinimumBalanceForRentExemptMint(connection);
            const transaction = new Transaction().add(
                SystemProgram.createAccount({
                    fromPubkey: wallet.publicKey,
                    newAccountPubkey : mintKeypair.publicKey ,
                    space : MINT_SIZE ,
                    lamports ,
                    programId : TOKEN_2022_PROGRAM_ID
                }),
                createInitializeAccount2Instruction(mintKeypair.publicKey,9,wallet.publicKey,TOKEN_2022_PROGRAM_ID)
            );

            transaction.feePayer = wallet.publicKey ;
            transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
            transaction.partialSign(mintKeypair);

            await wallet.sendTransaction(transaction , connection);
            console.log(`Token mint created as ${mintKeypair.publicKey.toBase58()}`)

        }
    }
    return  <div style={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column'
    }}>
        <h1>Solana Token Launchpad</h1>
        <input className='inputText' type='text' placeholder='Name'></input> <br />
        <input className='inputText' type='text' placeholder='Symbol'></input> <br />
        <input className='inputText' type='text' placeholder='Image URL'></input> <br />
        <input className='inputText' type='text' placeholder='Initial Supply'></input> <br />
        <button onClick={createToken} className='btn'>Create a token</button>
    </div>
}