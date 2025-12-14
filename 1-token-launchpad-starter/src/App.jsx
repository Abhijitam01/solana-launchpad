import './App.css'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import {
    WalletModalProvider,
    WalletDisconnectButton,
    WalletMultiButton
} from '@solana/wallet-adapter-react-ui';
import '@solana/wallet-adapter-react-ui/styles.css';
import { TokenLaunchpadFixed } from './components/TokenLaunchpadFixed';


function App() {
 return (
    <div>
      <ConnectionProvider endpoint={"https://api.devnet.solana.com"}>
        <WalletProvider wallets={[]} autoConnect>
           <WalletModalProvider>
            <div style={{
              display:'flex' ,
              justifyContent:'space-between',
              padding:'20'
            }}>
               <WalletMultiButton/>
               <WalletDisconnectButton/>
               <TokenLaunchpadFixed/>
             </div>
           </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </div>
  )
}

export default App
