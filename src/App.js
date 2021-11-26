import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import './App.css';
import abi from './utils/WavePortal.json'
import { WaveComponent } from "./wave.component";

export default function App() {

  const [currentAccount, setCurrentAccount] = useState('')
  const [allWaves, setAllWaves] = useState([])
  const [waveCount, setWaveCount] = useState(0)
  const contractAddress = "0xDA1CDE9509874eC50442847CD8bb2B073B003842"
  const contractABI = abi.abi
  const [message, setMessage] = useState('')

  const handleInputChange = async event => {
    const messageText = event.target.value
    //console.log('Text entered...', messageText)
    await setMessage(messageText)
    //await console.log('State message', message)
  }

  const clearMessage = () => {
    setMessage("")
  }

  const getAllWaves = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer)

        const waves = await wavePortalContract.getAllWaves()

        let count = await wavePortalContract.getTotalWaves()
        console.log('Retreived total wave count after waving...', count.toNumber())
        setWaveCount(count.toNumber())

        let cleanedWaves = []
        waves.forEach(wave => {
          cleanedWaves.push(
            {
              address: wave.waver,
              timestamp: new Date(wave.timestamp * 1000),
              message: wave.message
            }
          )
        })

        setAllWaves(cleanedWaves)

        wavePortalContract.on('NewWave', (from, timestamp, message) => {
          setAllWaves(prevState => [...prevState,
          {
            address: from,
            timestamp: new Date(timestamp * 1000),
            message: message
          }
          ])
        })

        //allWaves.map(wave => console.log(wave.message))

      } else {
        console.log('Ethereum object does not exist!')
      }
    } catch (e) {
      console.error(e)
    }
  }




  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        console.log('Make sure you have metamask')
        return
      } else {
        console.log("We have the ethereum object", ethereum)
      }

      //To check if we are authorised to access the wallet
      const accounts = await ethereum.request({ method: 'eth_accounts' })
      if (accounts.length !== 0) {
        const account = accounts[0]
        setCurrentAccount(account)
        console.log('Found an authorized account', account)
        getAllWaves();
       
        //allWaves.map(wave => console.log(wave))
      } else {
        console.log('No authorised account found')
      }
    } catch (e) {
      console.error(e)
    }

  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window
      if (!ethereum) {
        alert("Dude, get Metamask :|")
        return
      }

      const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
      const connectedAccount = accounts[0]
      console.log('Connected', connectedAccount)
      setCurrentAccount(connectedAccount)
    } catch (e) {
      console.error(e)
    }
  }

  const wave = async (e) => {
    try {
      e.preventDefault()
      clearMessage()
      const { ethereum } = window;
      if (ethereum) {
        //A provider is used to actually talk to Ethereum nodes
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer)

        const waveTxn = await wavePortalContract.wave(message, { gasLimit: 300000 })
        console.log("Mining..", waveTxn.hash)

        await waveTxn.wait()
        console.log('Mined...', waveTxn.hash)

        let count = await wavePortalContract.getTotalWaves()
        console.log('Retreived total wave count after waving...', count.toNumber())
        setWaveCount(count.toNumber())
        
      } else {
        console.log('Ethereum object does not exists')
        return
      }
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected()
  }, [])



  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
          👋 Hi!
        </div>

        <div className="bio">
          I am Shweta and I am new to Web3. I am absolutely loving it here and pretty excited to know what more it has in store for me. So let's connect :)
        </div>

        <div className="count">
          {waveCount} super nice people have waved at me already!
        </div>

        <div className="secondContainer">
          <div className="inputContainer">
            <div className="input">
              <input
                type='text'
                name="message"
                value={message}
                onChange={handleInputChange}
                placeholder="Enter your message here.." />
              <button id='link' onClick={clearMessage} >
                Clear
              </button>

            </div>
          </div>

          <div className="buttonContainer">
            <button className="waveButton" type='submit' onClick={wave}>
              Wave
            </button>

            {!currentAccount ? (
              <button className="waveButton" onClick={connectWallet}>
                Connect Wallet
              </button>
            ) : (
              <p className="text">Your wallet is connected!</p>
            )

            }
          </div>

        </div>

      </div>
      
      
      <div className="waveContainer">
        {allWaves.map((wave, index) => <WaveComponent key={index} wave={wave}></WaveComponent>)}
      </div>


    </div>
  );
}
