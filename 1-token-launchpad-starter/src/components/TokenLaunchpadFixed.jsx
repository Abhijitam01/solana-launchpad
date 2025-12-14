import { 
    createAssociatedTokenAccountInstruction, 
    createInitializeInstruction, 
    createInitializeMetadataPointerInstruction, 
    createInitializeMintInstruction, 
    createMintToInstruction, 
    ExtensionType, 
    getAssociatedTokenAddressSync,
    getMinimumBalanceForRentExemptMint, 
    getMintLen, 
    TOKEN_2022_PROGRAM_ID
} from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { Keypair, SystemProgram, Transaction } from "@solana/web3.js";
import { useRef } from "react";

export function TokenLaunchpadFixed() {
    const { connection } = useConnection();
    const wallet = useWallet();

    const nameRef = useRef(null);
    const symbolRef = useRef(null);
    const imageUrlRef = useRef(null);
    const supplyRef = useRef(null);

    async function createToken() {
        if (!wallet.connected || !wallet.publicKey) {
            alert("Please connect your wallet first");
            return;
        }

        const name = nameRef.current.value;
        const symbol = symbolRef.current.value;
        const imageUrl = imageUrlRef.current.value;
        const initialSupply = parseFloat(supplyRef.current.value) || 1000000000;

        const mintKeypair = Keypair.generate();

        const metadata = {
            mint: mintKeypair.publicKey, 
            name: name || 'KIRA',
            symbol: symbol || 'KIR',
            url: imageUrl || 'https://cdn.100xdevs.com/metadata.json',
            additionalMetadata: [],
        }

        const mintLen = getMintLen([ExtensionType.MetadataPointer]);
        const lamports = await connection.getMinimumBalanceForRentExemption(mintLen);

        const transaction = new Transaction().add(
            SystemProgram.createAccount({
                fromPubkey: wallet.publicKey,
                newAccountPubkey: mintKeypair.publicKey,
                space: mintLen,
                lamports,
                programId: TOKEN_2022_PROGRAM_ID
            }),
            createInitializeMetadataPointerInstruction(
                mintKeypair.publicKey, 
                wallet.publicKey, 
                mintKeypair.publicKey, 
                TOKEN_2022_PROGRAM_ID
            ),
            createInitializeMintInstruction(
                mintKeypair.publicKey, 
                9, 
                wallet.publicKey, 
                null, 
                TOKEN_2022_PROGRAM_ID
            ),
            createInitializeInstruction({
                programId: TOKEN_2022_PROGRAM_ID,
                mint: mintKeypair.publicKey,
                metadata: mintKeypair.publicKey,
                name: metadata.name,
                symbol: metadata.symbol,
                uri: metadata.url,
                mintAuthority: wallet.publicKey,
                updateAuthority: wallet.publicKey,
            }),
        );

        const { blockhash } = await connection.getLatestBlockhash();
        transaction.feePayer = wallet.publicKey;
        transaction.recentBlockhash = blockhash;
        transaction.partialSign(mintKeypair);

        try {
            const signature = await wallet.sendTransaction(transaction, connection);
            await connection.confirmTransaction(signature, 'confirmed');
            console.log(`Token mint created at ${mintKeypair.publicKey.toBase58()}`);
        } catch (error) {
            console.error("Error creating token:", error);
            alert("Failed to create token: " + error.message);
            return;
        }

        const associatedToken = getAssociatedTokenAddressSync(
            mintKeypair.publicKey,
            wallet.publicKey,
            false, 
            TOKEN_2022_PROGRAM_ID
        );

        console.log(associatedToken.toBase58());
        
        try {
            const { blockhash: blockhash2 } = await connection.getLatestBlockhash();
            const transaction2 = new Transaction().add(
                createAssociatedTokenAccountInstruction(
                    wallet.publicKey,
                    associatedToken,
                    wallet.publicKey,
                    mintKeypair.publicKey,
                    TOKEN_2022_PROGRAM_ID
                )
            );
            transaction2.feePayer = wallet.publicKey;
            transaction2.recentBlockhash = blockhash2;

            const signature2 = await wallet.sendTransaction(transaction2, connection);
            await connection.confirmTransaction(signature2, 'confirmed');
            console.log("Associated token account created");

            const { blockhash: blockhash3 } = await connection.getLatestBlockhash();
            const transaction3 = new Transaction().add(
                createMintToInstruction(
                    mintKeypair.publicKey, 
                    associatedToken, 
                    wallet.publicKey, 
                    initialSupply * Math.pow(10, 9), 
                    [], 
                    TOKEN_2022_PROGRAM_ID
                )
            );
            transaction3.feePayer = wallet.publicKey;
            transaction3.recentBlockhash = blockhash3;

            const signature3 = await wallet.sendTransaction(transaction3, connection);
            await connection.confirmTransaction(signature3, 'confirmed');
            console.log("Tokens minted successfully");
            alert("Token created successfully!");
        } catch (error) {
            console.error("Error in subsequent transactions:", error);
            alert("Failed to complete token creation: " + error.message);
        }
    }

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column'
        }}>
            <h1>Solana Token Launchpad</h1>
            <input ref={nameRef} type="text" className="inputText" placeholder="Name"/><br/>
            <input ref={symbolRef} type="text" className="inputText" placeholder="Symbol"/><br/>
            <input ref={imageUrlRef} type="text" className="inputText" placeholder="Image Url"/><br/>
            <input ref={supplyRef} type="text" className="inputText" placeholder="Initial supply"/><br/>
            <button onClick={createToken} className="btn">
                Create A Token
            </button>
        </div>
    );
}

