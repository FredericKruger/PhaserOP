Game = {};

const GameType = {
    AI : 0,
    RandomMatch: 1,
    Spectate: 2,
    MutualMatch : 3
};

Game.type = GameType.AI;

Game.Client = Client;
Client.game = Game;

Game.cardsys = Client.cardsys;