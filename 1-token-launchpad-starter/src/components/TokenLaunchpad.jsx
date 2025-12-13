export function TokenLaunchpad() {
    function createToken() {

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