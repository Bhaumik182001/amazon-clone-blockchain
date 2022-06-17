import { createContext, useState, useEffect } from 'react'
import { useMoralis, useMoralisQuery } from 'react-moralis'
//import { amazonAbi, amazonCoinAddress } from '../lib/constants'
import { ethers } from 'ethers'

export const AmazonContext = createContext()

export const AmazonProvider = ({children}) => {
    const [username, setUsername] = useState('')
    const [nickname, setNickname] = useState('')
    const [assets, setAssets] = useState([])

    const {authenticate, isAuthenticated, enableWeb3, Moralis, user, isWeb3Enabled} = useMoralis()

    const {
        data: assetsData,
        error: assetsDataError,
        isLoading: userDataisLoading
    } = useMoralisQuery('assets')

    const getAssets = async () => {
        try{
            await enableWeb3()
            setAssets(assetsData)
        } catch(error){
            console.log(error)
        }
    }

    useEffect(() => {
        ;(async() =>{
            if(isWeb3Enabled){
                await getAssets()
            }
        })()
    },[getAssets,isWeb3Enabled])

    useEffect(()=> {
        ;(async() => {
         if(isAuthenticated){
             const currrentUsername = await user?.get('nickname');
             setUsername(currrentUsername)
         }
        }) ()
     }, [isAuthenticated, user, username])

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
    
   

    return (
       <AmazonContext.Provider
       value={{
            isAuthenticated,
            nickname,
            setNickname,
            setUsername,
            username,
            handleSetUsername,
            assets
       }}
       >
        {children}
       </AmazonContext.Provider>
    )
}

