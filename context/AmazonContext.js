import { createContext, useState, useEffect } from 'react'
import { useMoralis, useMoralisQuery } from 'react-moralis'

import { ethers } from 'ethers'
import { amazonCoinAbi, amazonCoinAddress } from '../lib/constants'
import { AiFillFilter } from 'react-icons/ai'

export const AmazonContext = createContext()

export const AmazonProvider = ({children}) => {
    const [username, setUsername] = useState('')
    const [nickname, setNickname] = useState('')
    const [assets, setAssets] = useState([])
    const [currentAccount, setCurrentAccount] = useState('')
    const [tokenAmount, setTokenAmount] = useState('')
    const [amountDue, setAmountDue]= useState('')
    const [recentTransactions, setRecentTransactions] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [balance, setBalance] = useState('')
    const [etherscanLink, setEtherscanLink] = useState('')
    const [ownedItems, setOwnedItems] = useState([])

    const {authenticate, isAuthenticated, enableWeb3, Moralis, user, isWeb3Enabled} = useMoralis()

    const {
        data: assetsData,
        error: assetsDataError,
        isLoading: userDataisLoading
    } = useMoralisQuery('assets')

    const {
        data: userData,
        error: userDataError,
        isLoading: assetsDataisLoading,
    } = useMoralisQuery('_User')

    
    const listenToUpdates = async () => {
        let query = new Moralis.Query('EthTransactions')
        let subscription = await query.subscribe()
        subscription.on('update', async object => {
          setRecentTransactions([object])
        })
      }

    
    const getAssets = async () => {
        try{
            setAssets(assetsData)
        } catch(error){
            console.log(error)
        }
    }

    const connectWallet = () => {
        authenticate();
    }

    const getBalance = async () => {
        try{
            if(!isAuthenticated || !currentAccount) return
            const options = {
                contractAddress: amazonCoinAddress,
                functionName: 'balanceOf',
                abi: amazonCoinAbi,
                params: {
                    account: currentAccount
                },
            }

            if(isWeb3Enabled){
                const response = await Moralis.executeFunction(options)
                setBalance(response.toString())
            }

        }catch(error){
            console.log(error)
        }
    }

    const buyAsset = async (price, assets) => {
        try {
            if(!isAuthenticated) return

            const options = {
                type: 'erc20',
                amount: price,
                receiver: amazonCoinAddress,
                contractAddress: amazonCoinAddress,
            }

            let transaction = await Moralis.transfer(options)
            const receipt = await transaction.wait()

            if(receipt){
                const res = userData[0].add('ownnedAssets', {
                    ...assets,
                    purchaseDate: Date.now(),
                    etherscanLink: `https://rinkeby.etherscan.io/tx/${receipt.transactionHash}`
                })
            
                await res.save().then(()=>{
                    AiFillFilter("You've sucessfully purchased this asset!")
                })
            }

           

        }catch (error) {
            console.log(error)
        }
    }

    const buyTokens = async () => {
        if(!isAuthenticated) {
            await connectWallet()
        }

        const amount = ethers.BigNumber.from(tokenAmount)
        const price = ethers.BigNumber.from('100000000000000')
        const calcPrice = amount.mul(price)

        let options = {
            contractAddress: amazonCoinAddress,
            functionName: 'mint',
            abi: amazonCoinAbi,
            msgValue: calcPrice,
            params: {
                amount,
            },
        }

        const transition = await Moralis.executeFunction(options)
        const receipt = await transition.wait(4)
        setIsLoading(false)
        console.log(receipt)
        setEtherscanLink(
            `https://rinkeby.etherscan.io/tx/${receipt.transitionHash}`,
        )
    }

    const handleSetUsername = () => {
        if(user) {
            if(nickname){
                user.set('nickname', nickname)
                user.save()
                setNickname('')
            } else {
                console.log('Cannot set empty nickname')
            }
        } else {
            console.log('No User');
        }
    }

    useEffect(() => {
        ;(async() =>{
            if(isWeb3Enabled){
                await getAssets()
                await getOwnedAssets()
            }
        })()
    },[userData,assetsData, assetsDataisLoading, userDataisLoading])

    useEffect(()=> {
        ;(async() => {
         if(isAuthenticated){
            await getBalance()
            await listenToUpdates()
             const currrentUsername = await user?.get('nickname');
             setUsername(currrentUsername)
             const account = await user?.get('ethAddress')
             setCurrentAccount(account)
         }
        }) ()
    }, [isAuthenticated, user, username, currentAccount, getBalance, listenToUpdates])

    let count =0;
    const getOwnedAssets = async () => {
        try{
            if(userData[0]){
                setOwnedItems(prevItems => [
                    ...prevItems, userData[0].attributes.ownnedAssets
                ])
                count++;
                console.log(count)
            }
        }catch(error){
            console.log(error)
        }
    }
    
   

    return (
       <AmazonContext.Provider
       value={{
            isAuthenticated,
            nickname,
            setNickname,
            setUsername,
            username,
            handleSetUsername,
            assets,
            balance,
            setTokenAmount,
            amountDue,
            setAmountDue,
            isLoading,
            setIsLoading,
            setEtherscanLink,
            etherscanLink,
            currentAccount,
            buyTokens,
            tokenAmount,
            buyAsset, 
            recentTransactions,
            ownedItems,
       }}
       >
        {children}
       </AmazonContext.Provider>
    )
}

