import { createAssociatedTokenAccount, createAssociatedTokenAccountInstruction, createInitializeAccount2Instruction, createInitializeInstruction, createInitializeMetadataPointerInstruction, createInitializeMint2Instruction, createInitializeMintInstruction, createMintToInstruction, ExtensionType, getMinimumBalanceForRentExemptAccount, getMinimumBalanceForRentExemptMint, getMintLen, LENGTH_SIZE, MINT_SIZE, TOKEN_2022_PROGRAM_ID, TYPE_SIZE } from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { Connection, Keypair, SystemProgram, Transaction } from "@solana/web3.js";
import { connect } from "http2";

export function TokenLaunchpad() {
    const { connection } = useConnection();
    const wallet = useWallet();


    async function createToken() {

        const mintKeypair = Keypair.generate();

        const metadata = {
            mint : mintKeypair.publicKey , 
            name : 'KIRA' ,
            symbol : 'KIR ',
            url : 'https://cdn.100xdevs.com/metadata.json',
            additionalMetadata : [],
        }

        const mintLen = getMintLen([ExtensionType.MetadataPointer]);
        const metadataLength = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length ;

        const lamports = await getMinimumBalanceForRentExemptMint(connection) ;

        const transaction = new Transaction().add(
            SystemProgram.createAccount({
                fromPubkey       : wallet.publicKey      ,
                newAccountPubkey : mintKeypair.publicKey ,
                space            : MINT_SIZE             ,
                lamports                                 ,
                programId        : TOKEN_2022_PROGRAM_ID
            }),
            createInitializeMetadataPointerInstruction(mintKeypair.publicKey, wallet.publicKey, mintKeypair.publicKey, TOKEN_2022_PROGRAM_ID),
            createInitializeMintInstruction(mintKeypair.publicKey, 9, wallet.publicKey, null, TOKEN_2022_PROGRAM_ID),
            createInitializeInstruction({
                programId: TOKEN_2022_PROGRAM_ID,
                mint: mintKeypair.publicKey,
                metadata: mintKeypair.publicKey,
                name: metadata.name,
                symbol: metadata.symbol,
                uri: metadata.uri,
                mintAuthority: wallet.publicKey,
                updateAuthority: wallet.publicKey,
            }),
        );


        transaction.feePayer = wallet.publicKey ;
        transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
        transaction.partialSign(mintKeypair);


        await wallet.sendTransaction(transaction , connection);
        console.log(`Token mint created at ${mintKeypair.publicKey.toBase58()}`)

        const associatedToken = getAssociatedTokenAddressSync(
            mintKeypair.publicKey ,
            wallet.publicKey   ,
            false , 
            TOKEN_2022_PROGRAM_ID
        )

        console.log(associatedToken.toBase58());
        const transaction2  = new Transaction().add(
            createAssociatedTokenAccountInstruction(
                wallet.publicKey ,
                associatedToken ,
                wallet.publicKey ,
                mintKeypair.publicKey ,
                TOKEN_2022_PROGRAM_ID
            )
        );

        await wallet.sendTransaction(transaction2 , connection)

        const transaction3 = new Transaction().add(
            createMintToInstruction(mintKeypair.publicKey , associatedToken , wallet.publicKey , 1000000000 , [] , TOKEN_2022_PROGRAM_ID)
        );

        await wallet.sendTransaction(transaction3 , connection);

        
    }

    return <div  style={{
        height:'100vh',
        display:'flex',
        justifyContent:'center',
        alignItems:'center',
        flexDirection:'column'
    }}>
        <h1>
            Solana Token Launchpad
        </h1>
        <input type="text" className="inputText" placeholder="Name"/><br/>
        <input type="text" className="inputText" placeholder="Symbol"/><br/>
        <input type="text" className="inputText" placeholder="Image Url"/><br/>
        <input type="text" className="inputText" placeholder="Initial supply"/><br/>
        <button onClick={createToken} className="btn">
            Create A Token
        </button>
    </div>
}