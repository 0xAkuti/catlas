# 🐾 Calas 🌍

Catlas is a playful social app that lets you explore your neighborhood and the world. Snap a street cat, pin it on the map, and share the joy with cat lovers everywhere. Built for Base Batches 002: Builder Track.


## The Problem We're Solving

Today, many people spend their lives staring at screens, trapped indoors, isolated from their communities. This digital isolation is creating an epidemic of loneliness and depression. 

Meanwhile, countless street cats live in our neighborhoods, some are well-cared for by communities like those in Turkey, others struggling on their own. But everywhere, these cats could be the bridge that reconnects us all.

## Our Solution

Catlas gets people outside and exploring their neighborhoods while connecting them with cat lovers around the world. Our social app transforms casual cat encounters into meaningful community experiences.

## How It Works

Think Pokémon GO meets Zora, but for cat lovers. When you spot a street cat, snap a photo and upload it to Catlas. Our app instantly creates a cat profile and pins the exact location on our global map. Other users can then discover cats from around the world, "like" their favorites, and mint them as NFTs.

## Key Features

Global Cat Map: Real-time uploads create a living map of street cats worldwide
Earn While You Explore: Cat discoverers earn rewards when others mint their photos as NFTs
AI-Powered Discovery: Smart search finds cats by location, breed, or unique features
AI-Powered Cat check: AI will verify uploaded images, detect cat breed and also if the cat has welfare concerns and needs help
Built-in Charity: One-third of all NFT sales goes to animal rescue organizations (defined by smart contract)
Community Building: Leaderboards and local meetups bring cat lovers together in person
Decentralized Storage: Cat photos and NTF metadata are stored using IPFS

## TechStack

Next.js Modern frontend using latest next.js
ERC1155 NFT Custom and gas efficient ERC1155 contract using Solidity that contains all Catlas NFTs allows users to add new cats and shares profit with cat discoverers and charity
Privy + viem for interacting with Base we use privy + viem/wagmi
OpenRouter Using OpenRouter with Gemini and custom prompt to analyze uploaded cat images, extract features, check their health condition, describe the scene, etc
IPFS + Supabase Most of the data (NFT token data and images) is stored decentralized on IPFS, only likes are stored in our database, we also use the database for faster data querying

## Contract Address 
Deployed on Base: https://basescan.org/address/0x95e73cbbc2cd417c13362442f24515eaf8f167dc
Live on Opensea: https://opensea.io/collection/catlas

## Live Demo
https://catlas.xyz 


