class Player {

    constructor(isActivePlayer, numberOfCards) {
        this.isActivePlayer = isActivePlayer;
        
        this.decklist = [];
        for(let i = 0; i<numberOfCards; i++) {
            this.decklist.push(1);
        }
    }

}