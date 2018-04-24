## AirDrop UI

This UI was created to provide AirDrop functionality for all interested parties. Together with Userfeeds Platform custom algorithms it will provide targeted AirDrops for all.

## Setup local wallet for airdrop
To launch an airdrop you have to first have a local wallet with unlocked interface to automate the transaction signing

For example for parity:
`parity --chain=kovan --force-ui --jsonrpc-cors=all --unlock=0x0000005A13B7b781134A74c09d9D72ef00000000 --password=/pathtopassword`

` docker run -it -v /home/grzegorz/pass:/pass -v ~/.local/share/io.parity.ethereum/docker/:/root/.local/share/io.parity.ethereum/ -p 8545:8545 -p 8546:8546 -p 8180:8180 parity/parity --chain=kovan --force-ui --jsonrp
c-cors=all --password=/pass --ui-interface all --jsonrpc-interface all --ws-interface all --unlock=...`
