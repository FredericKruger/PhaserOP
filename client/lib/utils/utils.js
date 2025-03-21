class Utils {

    /**
     * 
     * @param {string} color 
     * @returns COLOR_ENUMS
     */
    getCardColor = function(color) {
        switch(color) {
            case "RED":
                return COLOR_ENUMS.OP_RED;
            case "GREEN":
                return COLOR_ENUMS.OP_GREEN;
            case "BLUE":
                return COLOR_ENUMS.OP_BLUE;
            case "PURPLE":
                return COLOR_ENUMS.OP_PURPLE;
            case "BLACK":
                return COLOR_ENUMS.OP_BLACK;
            case "YELLOW":
                return COLOR_ENUMS.OP_YELLOW;
        }
    }
    
    /**
     * 
     * @param {string[]} color 
     * @returns string
     */
    getCardSymbol = function(color, forDeck) {
        if(!forDeck) {
            return `ICON_SYMBOL_${color[0]}`;
        } else {
            let colorString = `ICON_SYMBOL_LEADER_${color[0]}`;
            if(color.length>1) colorString = `${colorString}_${color[1]}`;
            return colorString;
        }
    }

    /**
     * 
     * @param {string} color 
     * @returns 
     */
    getBannerFromColor = function(color) {
        return `BANNER_${color}`;
    }
    
    /**
     * 
     * @param {string} color 
     * @param {number} cost 
     * @returns string
     */
    getCardCost = function(color, cost) {
        return `COST_${color}_${cost}`;
    }
    
    /**
     * 
     * @param {string} attribute 
     * @returns string
     */
    getCardAttributeSymbol = function(attribute) {
        if(attribute === '') return null;
        return `ICON_ATTRIBUTE_SYMBOL_${attribute}`;
    }
    
    /**
     * 
     * @param {string} leaderArt 
     * @returns string
     */
    getLeaderArt = function(leaderArt) {
        return `LEADER_${leaderArt}`;
    }

    /**
     * 
     * @param {string} packArt 
     * @returns string
     */
    getPackArt = function(packArt) {
        return `PACK_ART_${packArt}`;
    }
    
    /**
     * Returns the glow color
     * @param {string} rarity 
     * @returns 
     */
    getRarityColor = function(rarity) {
        let glowColor = null;
        switch (rarity) {
            case 'COMMON':
                glowColor = COLOR_ENUMS.OP_WHITE;
                break;
            case 'UNCOMMON':
                glowColor = COLOR_ENUMS.OP_GREEN;
                break;
            case 'RARE':
                glowColor = COLOR_ENUMS.OP_BLUE;
                break;
            case 'SUPER RARE':
                glowColor = COLOR_ENUMS.OP_PURPLE; // Gold glow for legendary
                break;
            case 'LEADER':
                glowColor = COLOR_ENUMS.OP_ORANGE;
                break; // Gold glow for legendary
            case 'SECRET RARE':
                glowColor = COLOR_ENUMS.OP_GOLD; // Gold glow for legendary
                break;
            default:
                glowColor = COLOR_ENUMS.OP_WHITE; // Default white glow
        }
        return glowColor;
    }

    /**
     * Returns the glow color
     * @param {string} rarity 
     * @returns 
     */
    getShakeIntensity = function(rarity) {
        let intensity = 0;
        switch (rarity) {
            case 'COMMON':
                intensity = 0.01;
                break;
            case 'UNCOMMON':
                intensity = 0.025;
                break;
            case 'RARE':
                intensity = 0.05;
                break;
            case 'SUPER RARE':
                intensity = 0.075; // Gold glow for legendary
                break;
            case 'LEADER':
                intensity = 0.1;
                break; // Gold glow for legendary
            case 'SECRET RARE':
                intensity = 0.2; // Gold glow for legendary
                break;
            default:
                intensity = 0.01; // Default white glow
        }
        return intensity;
    }

    /**
     * Function that creates a spiral path from a start to an end target with various radius given an amount of turns.
     * Points will allow to determine the smoothness of the curve
     * @param {number} startX 
     * @param {number} startY 
     * @param {number} endX 
     * @param {number} endY 
     * @param {number} startRadius 
     * @param {number} endRadius 
     * @param {number} turns 
     * @param {number} points 
     * @returns 
     */
    generateSpiralPath(startX, startY, endX, endY, startRadius, endRadius, turns, points) {
        let pathPoints = [];
        let angleStep = (Math.PI * 2 * turns) / points;
        let radiusStep = (endRadius - startRadius) / points;

        for (let i = 0; i <= points; i++) {
            let angle = i * angleStep;
            let radius = startRadius + i * radiusStep;
            let x = endX + Math.cos(angle) * radius;
            let y = endY + Math.sin(angle) * radius;
            pathPoints.push(new Phaser.Math.Vector2(x, y));
        }

        return pathPoints;
    }

    /**
     * Helper function to load fonts
     * @param {string} name 
     * @param {string} url 
     */
    loadFont(name, url) {
        let newFont = new FontFace(name, `url(${url})`);
        newFont.load().then(function (loaded) {
            document.fonts.add(loaded);
        }).catch(function (error) {
            return error;
        });
    }

    /** Function to get the battle background from the random index
     * @param {number} index
     * @returns {string}
     */
    getBattleBackground(index) {
        let battleBackgroundList = Object.keys(ASSET_ENUMS).filter(key => key.startsWith('BATTLE_BACKGROUND'));
        return battleBackgroundList[index];
    }

    parseSVGPaths(svgData) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(svgData, 'image/svg+xml');
        const paths = doc.querySelectorAll('path');
        const pathPoints = [];
    
        paths.forEach(path => {
            const points = this.parseSVGPath(path.getAttribute('d'));
            pathPoints.push(points);
        });
    
        return pathPoints;
    }

    parseSVGPoints(svgData) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(svgData, 'image/svg+xml');
        const circles = doc.querySelectorAll('circle');
        const circleCoordinates = [];

        circles.forEach(circle => {
            const cx = parseFloat(circle.getAttribute('cx'));
            const cy = parseFloat(circle.getAttribute('cy'));
            circleCoordinates.push({ cx, cy });
        });

        return circleCoordinates;
    }

    parseSVGPath(svgPath) {
        const commands = svgPath.match(/[a-zA-Z][^a-zA-Z]*/g);
        const points = [];
        let currentPoint = { x: 0, y: 0 };
    
        commands.forEach(command => {
            const type = command[0];
            const values = command.slice(1).trim().split(/[\s,]+/).map(Number);
    
            switch (type) {
                case 'M':
                    currentPoint = { x: values[0], y: values[1] };
                    points.push(currentPoint);
                    break;
                case 'L':
                    currentPoint = { x: values[0], y: values[1] };
                    points.push(currentPoint);
                    break;
                case 'H':
                    currentPoint.x = values[0];
                    points.push({ ...currentPoint });
                    break;
                case 'V':
                    currentPoint.y = values[0];
                    points.push({ ...currentPoint });
                    break;
                case 'Z':
                    points.push(points[0]); // Close the path
                    break;
                // Add more cases for other SVG path commands as needed
            }
        });
    
        return points;
    }
}