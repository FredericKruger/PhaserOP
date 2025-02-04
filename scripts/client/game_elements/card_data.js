class CardData {
    constructor() {
        this.id = -1;
        this.setid = -1;

        this.art = "";
        this.set = "";
        this.setname = "";
        
        this.name = "";
        this.card = "";
        this.type = [];
        this.colors = [];
        this.attribute = "";
        
        this.cost = "";
        this.power = "";
        this.life = "";
         
        this.isleader = 0;
        this.rarity = "";
        this.counter = 0;

        this.amount = 0;
    }

    /**
     * @param {{ id: number; setid: number; art: string; set: string; setname: string; name: string; card: string; type: any[]; colors: any[]; attribute: string; cost: string; power: string; life: string; isleader: number; rarity: string; counter: number; }} cardData
     */
    setCardData(cardData) {
        this.id = cardData.id;
        this.setid = cardData.setid;

        this.art = cardData.art;
        this.set = cardData.set;
        this.setname = cardData.setname;
        
        this.name = cardData.name;
        this.card = cardData.card;
        this.type = cardData.type;
        this.colors = cardData.colors;
        this.attribute = cardData.attribute;
        
        this.cost = cardData.cost;
        this.power = cardData.power;
        this.life = cardData.life;
         
        this.isleader = cardData.isleader;
        this.rarity = cardData.rarity;
        this.counter = cardData.counter;
    }

    /**
     * @param {number} amount
     */
    setAmount(amount) {
        this.amount = amount;
    }
}