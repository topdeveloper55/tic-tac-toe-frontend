import { useState, useContext, useEffect } from 'react';
import './App.css';
import { Button, Input, Box, } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Web3Context } from "./Web3Context";
import TicABI from "./abi/TicTacToe.json";
import TokenABI from "./abi/TicToken.json";

const ticAddress = "0xf229d63227280fCf73A84Ec295e18F403D795F2a";
const tokenAddress = "0x24143E92dB1d4E483Fad326DD68A864Ca168Bcd7";

const useStyles = makeStyles({
  input: {
    border: "1px solid white",
    marginRight: "5px"
  },
});

function NavButton() {
  const classes = useStyles();
  const [stakes, setStakes] = useState("");
  const { connect, accounts, web3 } = useContext(Web3Context);

  useEffect(() => {
    connect();
  }, []);

  const handleStakesChange = event => {
    setStakes(event.target.value === "" ? "" : Number(event.target.value));
  };

  const handleCreate = async () => {
    if (stakes > 0) {
      const tokenContract = new web3.eth.Contract(TokenABI.abi, tokenAddress);
      const ticContract = new web3.eth.Contract(TicABI.abi, ticAddress);
      try {
        // console.log("default account: ", web3.currentProvider.chainId);
        await tokenContract.methods.approve(ticAddress, stakes * 1000000000).send({ from: accounts[0] });
        await ticContract.methods.createRoom().send({ from: accounts[0] });
      }
      catch (err) {
        console.error(err.message);
      }
    }
    else window.alert("Deposit amount should be bigger than 0.")
  }

  return (
    <>
      <Box margin={3} display="flex" justifyContent="flex-end" >
        <Box marginRight={5}>
          <Input placeholder="Enter deposit amount" className={classes.input}
            onChange={handleStakesChange} />
          <Button
            onClick={handleCreate}
            color="secondary"
            variant="contained"
            className="m-2"
          >
            Create a room
          </Button>
        </Box>
        <Button
          onClick={connect}
          color="secondary"
          variant="contained"
          className="m-2"
        >
          {accounts.length > 0 ? accounts[0].slice(0, 6) + "..." + accounts[0].slice(accounts[0].length - 3, accounts[0].length)
            : "Connect to Wallet"}
        </Button>
      </Box>
    </>
  );
}

export default NavButton;

