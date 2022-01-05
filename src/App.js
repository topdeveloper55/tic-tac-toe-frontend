import { useState, useContext, useEffect } from 'react';
import './App.css';
import { Grid, Box, Card, CardContent, CardActionArea, Typography } from '@mui/material';
import { Web3Context } from "./Web3Context";
import TicABI from "./abi/TicTacToe.json";
import TokenABI from "./abi/TicToken.json";
import Board from "./Board";
import NavButton from "./NavButton";

const ticAddress = "0x7084a15d0E644c236A14a6fdB12F862D389d5D2A";
const tokenAddress = "0x871F333b8064Fc6aa26a183712556B6e40E2C7cb";
let timeInterval;

function App() {
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [board, setBoard] = useState([]);
  const { connect, accounts, web3, connected } = useContext(Web3Context);

  const displayAddress = (address) => {
    if(address)
      return address.slice(0, 6) + "..." + address.slice(address.length - 3, address.length);
    else return "";
  } 

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
      console.log("rooms: ", buffer);
      let roomBuf = buffer.filter(room => (room.player1.toLowerCase() === accounts[0].toLowerCase() || room.player2.toLowerCase() === accounts[0].toLowerCase()) && room.end === false);
      setCurrentRoom(roomBuf.length === 0 ? null : roomBuf[0]);
      if(roomBuf.length > 0) {
        let boardInfo = await ticContract.methods.rowToString(roomBuf[0].id).call();
        boardInfo = boardInfo.split("|");
        setBoard(boardInfo);
        // console.log("board Info: ", boardInfo);
      }      
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

  const handleGoInto = async (id) => {
    if (rooms[id].player1 != 0 && rooms[id].player2 == 0) {
      const tokenContract = new web3.eth.Contract(TokenABI.abi, tokenAddress);
      const ticContract = new web3.eth.Contract(TicABI.abi, ticAddress);
      try {
        await tokenContract.methods.approve(ticAddress, rooms[id].stakes).send({ from: accounts[0] });
        await ticContract.methods.goToRoom(id).send({ from: accounts[0] });
      } catch (err) {
        console.error(err.message);
      }
    }
    else window.alert("This room can't be gone into");
  }

  const handlePut = async (cellId) => {
    const ticContract = new web3.eth.Contract(TicABI.abi, ticAddress);
    try {
      await ticContract.methods.performMove(currentRoom.id, cellId).send({ from: accounts[0] });
      const isGameOver = await ticContract.methods.isGameOver(currentRoom.id).call();
      if(isGameOver) {
        await ticContract.methods.withdraw(currentRoom.id).send({ from: accounts[0] });
        await ticContract.methods.endRoom(currentRoom.id).send({ from: accounts[0] });
      }
    } catch(err) {
      console.error(err.message);
    }
  }

  return (
    <>
      <NavButton />

      {rooms.filter(room => (room.player1.toLowerCase() === accounts[0]?.toLowerCase() || room.player2.toLowerCase() === accounts[0]?.toLowerCase()) && room.end === false).length == 0 ?
        <Box m={3}>
          <Grid container spacing={2}>
            {rooms.map((room, i) =>
              <Grid item xs={12} sm={6} md={3} key={i} >
                <Card sx={{ maxWidth: 345 }}>
                  <CardActionArea onClick={() => handleGoInto(i)}>
                    <CardContent>
                      <Typography gutterBottom variant="h5" color="text.secondary">
                        Room {i + 1}
                      </Typography>
                      <Typography varfiant="body2" color="text.secondary">
                        player1: {displayAddress(room.player1)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        player2: {displayAddress(room.player2)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        stakes: {(Number(room.stakes) / 1000000000.0).toFixed(3)} TIC
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        end status: {room.end ? "True" : "False"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Winner: {displayAddress(room.winner)}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>)}
          </Grid>
        </Box> :
        <Box>
          <Box display="flex" justifyContent="space-around" m={2}>
            <Typography>RoomId: {currentRoom && Number(currentRoom?.id) + 1}</Typography>
            <Typography>player1: {displayAddress(currentRoom?.player1)}</Typography>
            <Typography>player2: {displayAddress(currentRoom?.player2)}</Typography>
            <Typography>stakes: {currentRoom && (Number(currentRoom?.stakes) / 1000000000.0).toFixed(3)} TIC</Typography>           
          </Box>
          <Board squares={board.length === 9 ? board : []} onClick={handlePut} />
        </Box>}
    </>
  );
}

export default App;

// 