# Catlas

Create catlas, a dapp to share cats found around the world. The app should be mobile first but wiht responsive design.

Pages:
- Landing page, with https://magicui.design/docs/components/globe explaining the project in simple terms, don't overhype
- upload page to upload an image or record a new one via camera, also get the gps location from uploaded image or from gps permission when recording an image
    - allow the user to select a square region of the image, this will further be used
    - compress the image, scale down to 1024px squared if larger and use jpeg
    - send image to openrouter via openai sdk for processing, it should return a json with relevant data (check this file /home/vscode/wordcat-old/wordcat-app/catlas/lib/openrouter/client.ts for info)
    - if it's a cat: show summary NFT card of the cat with extracted info as a preview of how the cat would look like, allow users to update the nft title
        - when the user is happy they can click "Publish" which would register a new cat with the NFT smart contract
            - generate json metadata
            - upload image to ipfs
            - update imaeg ipfs path in metdata
            - upload metadata to ipfs
            - and mint one for free to the owner, calling publishCat()
- cat profile page, each cat should have a profile page that shows its NFT card, likes, nr minted, who discovered (created) the cat (NFT) and option to like and mint yourself
    - mint button would open a popup that shows the price, let's them select amount, and a mint button, also a note that the price is split between cat discoverer, Catlas service and projects suppporting cats (like shelter, food, medicine, ...), mint would trigger pricy so the user can sign the tx
- discover page: allows viewing all cats
    - has a map view by default which shows a openstreetmap with simplified map (no shops, ...) and markers on the map for discored cats (based on their GPS location), users can click on a marker to open that cat's profile
    - list view shows the cat's in a list with their main info like picture, title, color, location
    - both map and list are searchable, list can also be sorted by most likes, most recent/oldest
- user profile: shows their name, discored cats (cat NFTS they created) and collected cats (all cat NFTs also minted from others)

NFT:
- ERC1155 smart contract in Solidity using https://github.com/Vectorized/solady
- has publishCat function that takes a ipfs cid of the metadata and registeres it as a new cat collection meaning: get the next free tokenID, store the msg sender as the creator of that id, store the ipfs cid for the uri of that tokenId, mint the first NFT of that id to the creator
- mint function taking the tokenId to mint and amount, it checks the price is correct, mints the nft, and splits the received ether between contract owner (Catlas), nft creator, and charity address

Tech used:
- shadcn for ui
- privy for the wallet
- https://web3.storage for interacting with ipfs
- supabase (local test environment for now) for database
- openrouter via openai sdk
- use foundry for smart contract development, in contracts/ folder


Rules:
- keep files focused on one thing, keep them below 300 LOC
- use components for anything UI related to keep the project maintainable and reusable
- the project is not launched, so no need for keeping things for "compability",
- don't overcomplicate or future proof it, do what is asked
- it or add features not asked for without asking first
- don't mock or fake data or results
- no blue/purple gradients
- no badges/cards everyhwere unless meaningful
- Don't use emojis, you can use Lucide or https://phosphoricons.com/ Icons instead
- always commit after each smaller step, keep the commit messages as oneliners