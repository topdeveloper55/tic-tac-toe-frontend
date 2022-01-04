import { useState, useContext, useEffect } from 'react';
import './App.css';
import { Grid, Button, Input, Box, Card, CardContent, CardActionArea, Typography  } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Web3Context } from "./Web3Context";
import TicABI from "./abi/TicTacToe.json";
import TokenABI from "./abi/TicToken.json";
import Web3 from "web3";

const ticAddress = "0xb2fc451A05b28B3da61E371e10c0369Ded7d3C18";
const tokenAddress = "0xd11203407E3F04947A573995db5F0F171d923B81";
let timeInterval;

const useStyles = makeStyles({
  input: {
    border: "1px solid white",
    marginRight: "5px"
  },
});

function App() {
  const classes = useStyles();
  const [stakes, setStakes] = useState("");
  const [rooms, setRooms] = useState([]);
  const { connect, accounts, web3, connected } = useContext(Web3Context);

  const app = async () => {
    const ticContract = new web3.eth.Contract(TicABI.abi, ticAddress);
    try {
      let buffer = [];
      const roomCount = await ticContract.methods.roomCount().call();
      for (let i = 0; i < roomCount; i++) {
        const room = await ticContract.methods.rooms(i).call();
        buffer.push(room);
      }
      setRooms(buffer);
      console.log("rooms:", buffer);
    }
    catch (err) {
      console.error(err.message);
    }
  }
  
  useEffect(() => {
    connect();
  }, []);

  useEffect(() => {
    if (connected) {
      if (timeInterval) {
        clearInterval(timeInterval);
        timeInterval = setInterval(() => {
          app();
        }, 2000);
      } else 
        timeInterval = setInterval(() => {
          app();
        }, 2000);
    } 
  }, [connected, web3, accounts]);

  const handleStakesChange = event => {
    setStakes(event.target.value === "" ? "" : Number(event.target.value));
  };

  const handleCreate = async () => {
    if (stakes > 0) {
			const tokenContract = new web3.eth.Contract(TokenABI.abi, tokenAddress);
			const ticContract = new web3.eth.Contract(TicABI.abi, ticAddress);
      try {
        console.log("default account: ", web3.currentProvider.chainId);
				await tokenContract.methods.approve(ticAddress, stakes * 1000000000).send({from: accounts[0]});
				await ticContract.methods.createRoom().send({from: accounts[0]});
			}
			catch(err) {
				console.error(err.message);
			}
		}
		else window.alert("Deposit amount should be bigger than 0.")
  }
  
  const handleGoInto = async (id) => {
    const tokenContract = new web3.eth.Contract(TokenABI.abi, tokenAddress);
		const ticContract = new web3.eth.Contract(TicABI.abi, ticAddress);
    try {
      await tokenContract.methods.approve(ticAddress, rooms[id].stakes).send({ from: accounts[0] });
      await ticContract.methods.goToRoom(id).send({from: accounts[0]});
    } catch (err) {
      console.error(err.message);
    }
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
      <Box m={3}>
        <Grid container>
          {rooms.map((room, i) => 
          <Grid item xs={12} sm={6} md={3} key={i} >
            <Card sx={{ maxWidth: 345 }}>
              <CardActionArea onClick={() => handleGoInto(i)}>
                <CardContent>
                  <Typography gutterBottom variant="h5" color="text.secondary">
                    Room {i + 1}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    player1: {room.player1.slice(0, 6) + "..." + room.player1.slice(room.player1.length - 3, room.player1.length)}
                    </Typography>
                  <Typography variant="body2" color="text.secondary">
                    player2: {room.player2.slice(0, 6) + "..." + room.player2.slice(room.player2.length - 3, room.player2.length)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    stakes: {(Number(room.stakes)/1000000000.0).toFixed(3)} TIC
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    end status: {room.end ? "True" : "False"}    
                  </Typography>  
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>)}                 
        </Grid>
      </Box>
    </>
  );
}

export default App;
