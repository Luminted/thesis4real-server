* Project setup
* Design documents
	* deck
	* card
	* hand
	* settings
	* lobby
	* chat
	* voice chat
* wire frames

# TODO
* Input validator
* refactor handlers for singleton
* check/place return types on functions
* rethink if width/height is needed to be stored on server side for entity objects

## Design Documents

### Interaction Notes:
* Game is event based, meaning only events triggered on the front-end change the game state
* No concurrency - server processes events as they come in.

Nice to have:
* Latency interpolation
* reseating players

### Deck features
Must:
* Movable
	* has a handle
* Merge decks
* Multiple types: 
	* Hungarian
	* French
		* with/without Jokers
* Shuffle
* Reshuffle
* On click it spawns next card
	* Slightly offset
* Reset
* Remove
	* Removes all cards belonging to it

Nice to Have:
* Movable with ctrl+drag
* Custom deck
	* hand pick cards to be included

### Card features
Must:
* Movable
* Can be flipped
* Can be put in Hand
* Can be placed on Board
* Can be turned 90°
* Can be destroyed
* Highlighted with holder players name

Nice to have:
* Can be turned in any angle
* Animated

### Hand features
Must:
* Cards can be flipped
* Cards can be shown all at once
* Cards can be rearranged

Nice to have:
* Move cards from hand to hand
* Highlight on hover
* Auto-sort
* Animation
* Display is a drawer at the edge of the screen

### Table features
Nice to have:
* Card/Deck ancors
* Player cursor positions

### Lobby features:
Must:
* List rooms
* password protect room
* chat

### Room feature
Must:
* destroy room
* kick people
* give owner right
* quit

### Communication features:
Must:
* Lobby chat
* Room chat

Nice to have: 
* VOIP
* DM
* Emotes - Quelching

### Control panel
Must:
* Spawning decks
* Player list
	* Initiate direct messaging
Nice to have:
* Setting rules
	* password for room
	* control profiles
		* eg cards can be turned with what degree increment
	* Quelch everybody
* configure controls
	
### Player features:
* Avatar
* Name

Nice to have:
* latency measure
* stats
* medals
* configurable controls

### Architecture features
* logging

### Interactions

## Card
* move -> left click + move
* flip over -> right click
* turn 90 -> ctrl + left click
* instantly put in hand -> double left click
## Deck
* move -> left click + move
* draw card -> left click
* draw card turned up -> ctrl + left click
* draw card to hand -> double left click
* turn 90 -> context menu
## Hand
* move in hand -> left click + move
* move to table -> left click + move
* move to other hand -> left click + move
* reveal in hand ->ctrl + left click
* move to table face down -> right click + move


## Story#1 - Movable card placeholder
Setup basic infrastructure.

Interactions with cards are sent to the server. The server handles the interactions and sends back the result to the client.

* Parent table
	* renders cards
	* renders table
	* keeps bounds
	* adds listeners
* Card
	* sends events to server
* Card movable on UI
* Card position stored in backend
* Card position synced on clients
* Card locked for anyone else to grab

# Story#2 - Deck placeholder
Decks hold cards. Interactions are sent to the server and result is sent back to the client

* On click the next card is spawned
* Deck can be reset
* Can be removed
* can be moved	

# Story#3 - Synced game state across clients
Players connect to one common room.
On every interaction triggers a sync event towards clients.

# Story#4 - Hands
Players can hold cards in their hands.

* A hitbox is defined for every players hand
* Players can only add card to their own hands.
* some visual indication of hovering over card.
* if card is moved beyond table borders, and are released outside players hand, they snap back to their original position.

# Story #12 - Deployment
Deploy project to a server. Add CI if possible.

# Story#16 - Concurrent player interractions

Game entities need to be locked for player who is interacting with them.

# Story#11 - Spawn decks
A deck can be made up of multiple decks

# Story#5 - Further interaction with cards
Players can:

* Flip cards
* Turn cards 90 degerees
* Z Level handling

# Story#14 - Further interactions with deck
Decks can spawn cards face up/down.

# Story#17 - Error handling
Introduce error handling and propagation towards the front end.

# Story#13 - Skin cards
Add skins for French and Hungarian cards

# Story#15 - Table Graphics

# Story#6 - Players seated on other sides of the table
Players can sit on opposit sides of the table. Players always see themselves sitting at the "bottom" of the table. Transformations are needed to be applied to the movement of cards.

# Story#7 - Lobby
Players can are furts put in a lobby where they can create, join and leave rooms.

* Rooms can be set to private with passwords
* Room can hold at least 4 persons
* Rooms are removed if they get empty

# Story#7 - Room chat

# Story#8 - Lobby chat

# Story#9 - Advanced Hand interactions
Players can: 
* flip cards in their hands
* reveal their whole hands
* throw down all hand
* rearrange cards

# Story#10 - Room includes Lobby chat


# Story#18 - Implement needed socket communication steps
* Handle connet
* Handle disconnect
* Handle reconnect