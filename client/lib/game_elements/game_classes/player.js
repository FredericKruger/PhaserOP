class Player {

    constructor(isActivePlayer, numberOfCards) {
        this.isActivePlayer = isActivePlayer;
        
        this.decklist = [];
        for(let i = 0; i<numberOfCards; i++) {
            this.decklist.push(1);
        }

        //Keep track of the life totals
        this.totalLife = 0;
        this.currentLife = 0;
    }

    /** Function that sets the life totals 
     * @param {number} life - The life total
     */
    setLife(life) {
        this.totalLife = life;
        this.currentLife = life;
    }

}