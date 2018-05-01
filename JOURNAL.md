
## 2018-05-01 Yak Shaving

I decided to do a quicky! Just add a simple example of a game provisionally called - Spaceship. The idea was for a text adventure style game played in node console.

Then I realised, that `eventMap` and `initialState` have a lot of duplication, so I decided to add a functionality to the `matejs`:

`toEventMapAndInitialState = (instructions: StoreInstructions) => {eventMap: EventMap, initialState: State}`

Alright, so I started working on the functionality, but I have to go to work soon, so I decided to add a note in MD. And then I realized that default word wrap logic in Visual Studio Code annoyed the hell out of me. And I spent next five minutes configuring it.

Good news - I have a basic spec/test for the `toEventMapAndInitialState` so I should remember what I wanted to do tonight/tomorrow.

Morale of the story: Write tests first kids. Even unfinished specs contain more information than finished code.

P.S. I need to explore grammarly plugins for VS Code.
