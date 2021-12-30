import { useState } from "react"
import { ethers } from "ethers"
export const useLogin = () => {
	const [isLogin, setIsLogin] = useState(false)
	const [error, setError] = useState("")
	const [account, setAccount] = useState("")
	const [loading, setLoading] = useState(false)
	const [balance, setBalance] = useState(0)

	//get balance
	const getBalance = address => {
		window.ethereum
			.request({ method: "eth_getBalance", params: [address, "latest"] })
			.then(balance => {
				setBalance(ethers.utils.formatEther(balance))
				setLoading(false)
				setIsLogin(true)
				setError("")
			})
			.catch(err => console.log("getBalance err :: ", err))
	}

	//login with meta mask
	const login = () => {
		setLoading(true)
		if (window.ethereum) {
			window.ethereum
				.request({ method: "eth_requestAccounts" })
				.then(accounts => {
					setAccount(accounts[0])
					getBalance(accounts[0])
				})
				.catch(err => console.log("req acc err :: ", err))
		} else {
			setError("Install MetaMask!!!")
			setLoading(false)
		}
	}

	return {
		isLogin,
		account,
		error,
		loading,
		balance,
		login,
	}
}
