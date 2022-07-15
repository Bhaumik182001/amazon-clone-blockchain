import React, { useContext, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import { AmazonContext } from '../context/AmazonContext'

import Transaction from '../components/Transaction'

const history = () => {
  const styles = {
    container: `h-full w-full flex bg-[#fff]`,
    main: `w-full h-full flex flex-col mt-[50px]`,
    tableContainer: `w-full h-full flex flex-col p-[100px] justify-center`,
    pageTitle: `text-2xl font-bold text-left mt-[50px] mb-[30px]`,
    transactions: `flex gap-[50px] flex-row flex-wrap`,
  }
  const { ownedItems } = useContext(AmazonContext)

  return (
    <div className={styles.container}>
     
       
    </div>
  )
}

export default history
